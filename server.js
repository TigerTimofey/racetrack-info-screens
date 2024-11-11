const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("authenticate", (data) => {
    let isAuthenticated = false;
    console.log("data.key", data.key);
    if (data.key === process.env.RECEPTIONIST_KEY) {
      isAuthenticated = true;
    } else if (data.key === process.env.OBSERVER_KEY) {
      isAuthenticated = true;
    } else if (data.key === process.env.SAFETY_KEY) {
      isAuthenticated = true;
    }

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
