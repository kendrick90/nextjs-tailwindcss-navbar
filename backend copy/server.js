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
    console.log("Loading initial state from file...");
    const data = fs.readFileSync(filePath, "utf8");
    console.log("Initial state loaded from file successfully");
    console.log(`Initial State: ${data}`);
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading initial state:", error);
    return null;
  }
};

// Initialize elementStates
let elementStates = loadInitialState();
if (!elementStates) {
  console.log("Initializing with default values");
  // If loading fails or the file doesn't exist, initialize with default values
  elementStates = {
    modes: Array(4).fill({ name: "", enabled: false, intensity: 0.5 }),
    effects: Array(8).fill({ name: "", enabled: false, intensity: 0.0 }),
    settings: Array(16).fill({ name: "", value: 0 }),
  };
  console.log("Default server values initialized");
  console.log(`Initial State: ${JSON.stringify(elementStates)}`);
}

// Socket.io handlers
io.on("connection", (socket) => {
  // Store the IP address of the client
  socket.ip = socket.handshake.address;
  console.log(`User Connected. ID: ${socket.id} IP: ${socket.ip}`);

  socket.on("request_full_state", () => {
    console.log("Received request for full state");
    socket.emit("full_state", JSON.stringify(elementStates));
    console.log("Sent full state to client");
  });

  socket.on("merge_elements", (data) => {
    console.log("Received elements to merge with the current state");
    console.log(`Received elements: ${JSON.stringify(data)}`);

    // Update elementStates with the new data
    Object.assign(elementStates, data);

    // Emit the full updated state to all clients
    io.emit("full_state", JSON.stringify(elementStates));
    console.log("Sent updated full state to all clients");
    console.log(`Full State: ${JSON.stringify(elementStates)}`);
  });
  socket.on("reset_modes", () => {
    console.log("Resetting modes");
    // Reset modes logic
    elementStates.modes = elementStates.modes.map((mode) => ({
      ...mode,
      enabled: false,
      intensity: 0.0,
    }));
    // broadcast the updated modes
    io.emit("full_state", JSON.stringify(elementStates));
    console.log(JSON.stringify(elementStates));
    console.log("Sent full state to all clients");
  });


  socket.on("send_text", (data) => {
    socket.broadcast.emit("receive_text", data);
  });
});

// Start socket.io server and show ip address and port
const PORT = process.env.PORT || 3001;
const ip = require('ip');
server.listen(PORT, "0.0.0.0", () => {
  console.log('Socket.io server running at http://' + ip.address() + ':' + PORT);
});
