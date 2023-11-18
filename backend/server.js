// server.js
// Sockety.io server and state management

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const filePath = path.join(__dirname, "initial_state.json");
const fs = require("fs");

const app = express();
app.use(cors());

const numModes = 16;
const numEffects = 16;

// Create server. Cors is needed to allow
// cross-origin requests on localhost
// ie http on 3000 and ws on 3001
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow requests from all origins (you can configure this as needed)
    methods: ["GET", "POST"],
  },
  allowEIO3: true,
});

// Load initial state from file
const loadInitialState = () => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading initial state:", error);
    return null;
  }
};

// Initialize state
let elementStates = loadInitialState();
if (!elementStates) {
  // If loading fails or the file doesn't exist, initialize with default values
  elementStates = {
    modes: Array(numModes).fill({ name: "", enabled: false, intensity: 0.0 }),
    effects: Array(numEffects).fill({ name: "", enabled: false, intensity: 0.0 }),
    settings: Array(16).fill({ name: "", value: 0 }),
  };
}

let lastModeSelected = 1;

// Socket.io handlers
io.on("connection", (socket) => {
  socket.ip = socket.handshake.address;
  console.log(`User Connected. ID: ${socket.id} IP: ${socket.ip}`);

  // Update state
  function updateElementState(data) {
    const { id, category, value } = data;

    // Parse the current elementStates JSON
    const states = JSON.parse(elementStates);

    // Check if the category and ID are valid
    if (states[category] && id > 0 && id <= states[category].length) {
      console.log("Category is in states and ID is valid... updating state");

      // Handle modes
      if (category === "modes") {
        newModeSelected = id;

        if (states.modesExclusive[0]) {
          console.log("Mode exclusive is true, treating modes as exclusive toggles");
          // Handle mode updates as exclusive toggles
          if (value) {
            // If the mode is being turned on, turn off the last mode selected
            states.modes[lastModeSelected - 1] = false;
            states.modes[id - 1] = true;
            elementStates = JSON.stringify(states);
            io.emit("full_state", elementStates);
            console.log("Sent full state to all clients");
            console.log(`Full State: ${elementStates}`);
          } else {
            // If the mode is being turned off just turn it off
            states.modes[id - 1] = false;
            elementStates = JSON.stringify(states);
            socket.broadcast.emit("element_updated", { id, category, value });
            console.log("all modes turned off");
          }
        } else {
          // Treat modes as regular toggles/booleans
          console.log("Mode exclusive is false, treating modes as regular toggles");
          states[category][id - 1] = value;
          elementStates = JSON.stringify(states);
          socket.broadcast.emit("element_updated", { id, category, value });
          console.log("Updated single mode normally");
        }

        // Update lastModeSelected
        lastModeSelected = newModeSelected
        console.log("Last mode selected: " + lastModeSelected);
      }

      // Handle modesExclusive toggle
      else if (category === "modesExclusive") {
        console.log("Updating modesExclusive state");
        states.modesExclusive[0] = value;

        if (value) {
          // If modesExclusive is being turned on, turn off all modes except the last one selected
          console.log("Mode exclusive changing to true, turning off all modes except last one selected");
          for (let i = 0; i < states.modes.length; i++) {
            if (i !== lastModeSelected - 1) {
              states.modes[i] = false;
            }
          }
          states.modes[lastModeSelected - 1] = true;
          // Send full state to all clients
          elementStates = JSON.stringify(states);
          io.emit("full_state", elementStates);
          console.log("Sent full state to all clients");
          console.log(`Full State: ${elementStates}`);
        } else {
          // If modesExclusive is being turned off, leave modes as is
          console.log("Mode exclusive changing to false, leaving modes as is");
          elementStates = JSON.stringify(states);
          socket.broadcast.emit("element_updated", { id, category, value });
          console.log("Modes exclusive updated to: " + states.modesExclusive[0]);
        }
      }

      else {
        // Handle regular items
        console.log("Updating regular item");
        states[category][id - 1] = value;
        elementStates = JSON.stringify(states);
        socket.broadcast.emit("element_updated", { id, category, value });
        console.log(`Element updated. Category: ${category}, ID: ${id}, Value: ${value}`);
      }

    } else {
      // Handle invalid category or ID
      console.error(`Invalid category or ID: ${category}, ${id}`);
      return;
    }
  }


  socket.on("request_full_state", () => {
    socket.emit("full_state", JSON.stringify(elementStates)); // Send client full state
    console.log(`Sent full initial state to client IP: ${socket.ip}`);
    console.log(`Full State: ${JSON.stringify(elementStates)}`);
  });

  socket.on("update_element", (data) => {
    updateElementState(data);
  });

  socket.on("reset_modes", () => {
    const states = JSON.parse(elementStates);
    states.modes = Array(numModes).fill(false);
    states.modeSliders = Array(numModes).fill(0);
    elementStates = JSON.stringify(states);
    io.emit("full_state", elementStates);
    console.log("Reset Modes");
  });

  socket.on("reset_effects", () => {
    const states = JSON.parse(elementStates);
    states.effects = Array(numEffects).fill(false);
    states.effectSliders = Array(numEffects).fill(0);
    elementStates = JSON.stringify(states);
    io.emit("full_state", elementStates);
    console.log("Reset Effects");
  });

  socket.on("send_text", (data) => {
    socket.broadcast.emit("receive_text", data);
  });
});

// Start socket.io server
server.listen(3001, "0.0.0.0", () => {
  console.log("Server is running on port 3001");
});
