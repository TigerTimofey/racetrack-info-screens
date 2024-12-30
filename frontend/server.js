const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: `${process.env.REACT_APP_SERVER_URL}`,
    methods: ["GET", "POST"],
  },
});

// Map roles to passwords
const rolePasswords = {
  Receptionist: process.env.RECEPTIONIST_KEY,
  LapLineObserver: process.env.OBSERVER_KEY,
  SafetyOfficial: process.env.SAFETY_KEY,
};

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("authenticate", (data) => {
    const { key, role } = data; // Get both the key and role from the data

    let isAuthenticated = false;

    // Check if the provided key matches the role's expected password
    if (role && rolePasswords[role] && key === rolePasswords[role]) {
      isAuthenticated = true;
    }

    // Emit the authentication result
    socket.emit("authenticated", isAuthenticated);
    console.log(`Authentication status for ${socket.id}:`, isAuthenticated);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
