// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
  allowEIO3: true, // For touchdesigner compatibility
});

const initializeElementStates = () => {
  const numModes = 16;
  const numEffects = 16;
  return JSON.stringify({
    modes: Array(numModes).fill(false),
    modeSliders: Array(numModes).fill(0),
    effects: Array(numEffects).fill(false),
    effectSliders: Array(numEffects).fill(0.5),
    settings: Array(16).fill(0),
    settingsSliders: Array(16).fill(0.5),
    palettes: [
      ["#ff0000", "#00ff00", "#0000ff", "#000000"],
      ["#ff0000", "#00ff00", "#0000ff", "#000000"],
      ["#ff0000", "#00ff00", "#0000ff", "#000000"],
      ["#ff0000", "#00ff00", "#0000ff", "#000000"],
    ],
    selectedPalette: 1,
    modesExclusive: false,
  });
};

let elementStates = initializeElementStates();

function updateElementState(data) {
  const { id, category, value } = data;
  let states = JSON.parse(elementStates);

  if (category === 'modesExclusive') {
    states[category] = value;
  } else if (category === 'modes') {
    if (states.modesExclusive && value) {
      states.modes.fill(false);
    }
    states[category][id - 1] = value;
  } else if (states[category] && id > 0 && id <= states[category].length) {
    states[category][id - 1] = value;
  } else {
    console.error(`Invalid category or ID: ${category}, ${id}`);
    return;
  }

  elementStates = JSON.stringify(states);
}

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("request_initial_state", () => {
    socket.emit("element_updated", elementStates); // Update client
    console.log("Sent initial state to client:", socket.id);
  });

  socket.on("update_element", (data) => {
    updateElementState(data);
    io.emit("element_updated", elementStates); // Update all clients
    console.log(`State updated. Category: ${data.category}, ID: ${data.id}, Value: ${data.value}`);
  });

  socket.on("send_text", (data) => {
    socket.broadcast.emit("receive_text", data);
  });
});

server.listen(3001, () => {
  console.log("Server is running on port 3001");
});
