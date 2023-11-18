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
let lastModeSelected = 1;

// Create server. Cors is needed to allow
// cross-origin requests on localhost
// ie http on 3000 and ws on 3001
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow requests from all origins (you can configure this as needed)
    methods: ["GET", "POST"],
  },
  allowEIO3: true,  //legacy support required for touchdesigner
});

// Load initial state from file
const loadInitialState = () => {
  try {
    console.log("Loading initial state...");
    const data = fs.readFileSync(filePath, "utf8");
    console.log("Initial state loaded successfully");
    console.log(`Initial State: ${data}`);
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading initial state:", error);
    return null;
  }
};

// Initialize elementState
let elementStates = loadInitialState();
if (!elementStates) {
  console.log("Initializing with default values");
  // If loading fails or the file doesn't exist, initialize with default values
  elementStates = {
    modes: Array(numModes).fill({ name: "", enabled: false, intensity: 0.0 }),
    effects: Array(numEffects).fill({ name: "", enabled: false, intensity: 0.0 }),
    settings: Array(16).fill({ name: "", value: 0 }),
  };
  console.log("Default values initialized");
  console.log(`Initial State: ${JSON.stringify(elementStates)}`);
}

// Socket.io handlers
io.on("connection", (socket) => {
  socket.ip = socket.handshake.address;
  console.log(`User Connected. ID: ${socket.id} IP: ${socket.ip}`);

  // Handle merging JSON elements
  socket.on("merge_elements", (data) => {
    console.log("Merging elements with the current state");

    // Merge the received JSON object with the existing elementStates
    elementStates = { ...elementStates, ...data };
    // get the keys of the merged object
    // const keys = Object.keys(elementStates);

    io.emit("full_state", JSON.stringify(elementStates));
    console.log("Sent updated full state to all clients");
    console.log(`Full State: ${JSON.stringify(elementStates)}`);
  });

  // // // Update state
  // // function updateElementState(data) {
  // //   const { id, category, value } = data;
  // //   console.log(`Updating element. Category: ${category}, ID: ${id}, Value: ${value}`);

  // //   // Parse the current elementStates JSON
  // //   const states = JSON.parse(elementStates);
  // //   console.log("Current states: " + JSON.stringify(states));

  // //   // Check if the category and ID are valid
  // //   if (states[category] && id > 0 && id <= states[category].length) {
  // //     console.log("Category is in states and ID is valid... updating state");

  // //     // Handle modes
  // //     if (category === "modes") {
  // //       newModeSelected = id;
  // //       console.log("Updating modes id: " + id);

  // //       if (states.modesExclusive[0]) {
  // //         console.log("Mode exclusive is true, treating modes as exclusive toggles");
  // //         // Handle mode updates as exclusive toggles
  // //         if (value) {
  // //           // If the mode is being turned on, turn off the last mode selected
  // //           console.log("Mode is being turned on, turning off last mode selected");
  // //           states.modes[lastModeSelected - 1] = false;
  // //           states.modes[id - 1] = true;
  // //           elementStates = JSON.stringify(states);
  // //           io.emit("full_state", elementStates);
  // //           console.log("Sent full state to all clients");
  // //           console.log(`Full State: ${elementStates}`);
  // //         } else {
  // //           // If the mode is being turned off just turn it off
  // //           states.modes[id - 1] = false;
  // //           elementStates = JSON.stringify(states);
  // //           socket.broadcast.emit("element_updated", { id, category, value });
  // //           console.log("all modes turned off");
  // //         }
  // //       } else {
  // //         // Treat modes as regular toggles/booleans
  // //         console.log("Mode exclusive is false, treating modes as regular toggles");
  // //         states[category][id - 1] = value;
  // //         elementStates = JSON.stringify(states);
  // //         socket.broadcast.emit("element_updated", { id, category, value });
  // //         console.log("Updated single mode normally");
  // //       }

  // //       // Update lastModeSelected
  // //       lastModeSelected = newModeSelected
  // //       console.log("Last mode selected: " + lastModeSelected);
  // //     }

  // //     else {
  // //       // Handle regular items
  // //       console.log("Updating regular item");
  // //       states[category][id - 1] = value;
  // //       elementStates = JSON.stringify(states);
  // //       socket.broadcast.emit("element_updated", { id, category, value });
  // //       console.log(`Element updated. Category: ${category}, ID: ${id}, Value: ${value}`);
  // //     }

  // //   } else {
  // //     // Handle invalid category or ID
  // //     console.error(`Invalid category or ID: ${category}, ${id}`);
  // //     return;
  // //   }
  // // }

  // socket.on("update_element", (data) => {
  //   // updateElementState(data);
  // });

  socket.on("request_full_state", () => {
    console.log(`Received request for full state from client IP: ${socket.ip}`);
    socket.emit("full_state", JSON.stringify(elementStates));
    console.log(`Sent full state to client IP: ${socket.ip}`);
    console.log(`Full State: ${JSON.stringify(elementStates)}`);
  });

  socket.on("reset_modes", () => {
    console.log("Resetting modes");
    // Reset modes
    elementStates.modes = Array(numModes).fill({ name: "", enabled: false, intensity: 0.0 });

  });

  socket.on("send_text", (data) => {
    socket.broadcast.emit("receive_text", data);
  });
});

// Start socket.io server and show ip address and port
const PORT = process.env.PORT || 3001;
const ip = require('ip');
server.listen(PORT, "0.0.0.0", () => {
  console.log('Socket.io server running at http://' + ip.address() + ':' + PORT + '/');
});
