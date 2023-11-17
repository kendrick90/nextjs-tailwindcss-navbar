// server.js
// Sockety.io server and state management

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

// Create server. Cors is needed to allow
// cross-origin requests on localhost
// ie http on 3000 and ws on 3001
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // origin: "http://localhost:3000",
    origin: "*",
    // origin: "http://*.local:3000",
    // origin: "http://studio-15.local",
    methods: ["GET", "POST"],
  },
  allowEIO3: true,
});

// Create initial state json for server
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

// Initialize state
let elementStates = initializeElementStates();

// Update state
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

// Socket.io handlers

io.on('connection', function (sock) {
  var clientIpAddress = sock.request.headers['x-forwarded-for'] || sock.request.connection.remoteAddress;
  console.log(' new request from : ' + clientIpAddress);
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);
  const client = socket.id;
  const ip = client.ip;

  var address = socket.handshake.address;
  console.log('New connection from ' + address.address + ':' + address.port);


  socket.on("request_initial_state", () => {
    socket.emit("initial_state", elementStates); // Send client full initial state
    console.log("Sent full initial state to client:", socket.id);
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

// Start socket.io server
server.listen(3001, "0.0.0.0", () => {
  console.log("Server is running on port 3001");
});
