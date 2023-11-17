// server.js

const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
  allowEIO3: true, // needed for touchdesigner compatibility
});

let elementStates = {
  modes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  effects: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  settings: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
  modeSliders: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,],
  effectSliders: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,],
  settingsSliders: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,],
  colors: [["#ff0000", "#00ff00", "#0000ff", "#000000"], ["#000000", "#00ff00", "#0000ff", "#000000"], ["#ff0000", "#000000", "#0000ff", "#000000"], ["#ffffff", "#ffffff", "#ffffff", "#ffffff"]],
  palette: 1,
};

io.on("connection", (socket) => {
  // When a user connects log it and send them the initial state
  console.log(`User Connected: ${socket.id}`);
  socket.emit("initial_state", elementStates);

  // Helper function to update an element
  const updateElement = (elementType, index, value) => {
    elementStates[elementType][index] = value;
    console.log(`${elementType} element with index ${index} updated to value ${value}`);
  };

  // when an element is updated in the UI, update the state in the backend and broadcast it
  socket.on("update_element", (data) => {
    switch (data.type) {
      case "slider":
        updateElement("sliders", data.index, data.value);
        break;
      case "button":
        const elementType = data.id.includes("mode")
          ? "modes"
          : data.id.includes("effect")
            ? "effects"
            : "settings";
        updateElement(elementType, data.index, data.value);
        break;
      case "xyPad":
        elementStates.xyPad = data.value;
        console.log(`xyPad element updated to value ${JSON.stringify(data.value)}`);
        break;
      case "color":
        updateElement("colors", data.index, data.value);
        break;
      default:
        console.log(`Unsupported element type: ${data.type}`);
    }

    socket.broadcast.emit("element_updated", data);
    console.log(`Broadcasted element_updated event for element with ID ${data.id}`);
  });

  socket.on("send_text", (data) => {
    console.log(data);
    socket.broadcast.emit("receive_text", data);
  });
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});