const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { MongoClient, ObjectId } = require("mongodb"); // Import ObjectId
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

const client = new MongoClient(process.env.MONGODB_URI);
let db;

const startMongoDB = async () => {
  try {
    await client.connect();
    db = client.db();
    console.log("Connected to MongoDB");

    const collections = await db.listCollections().toArray();
    const collectionExists = collections.some(
      (collection) => collection.name === "races"
    );

    if (!collectionExists) {
      await db.createCollection("races");
      console.log("Created 'races' collection");
    }
  } catch (e) {
    console.error("MongoDB connection error:", e);
    process.exit(1);
  }
};

startMongoDB();

app.use(cors());
app.use(express.json());

const rolePasswords = {
  Receptionist: process.env.RECEPTIONIST_KEY,
  LapLineObserver: process.env.OBSERVER_KEY,
  SafetyOfficial: process.env.SAFETY_KEY,
};

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("authenticate", (data) => {
    const { key, role } = data;
    let isAuthenticated = false;

    if (role && rolePasswords[role] && key === rolePasswords[role]) {
      isAuthenticated = true;
    }

    socket.emit("authenticated", isAuthenticated);
    console.log(`Authentication status for ${socket.id}:`, isAuthenticated);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.post("/api/races", async (req, res) => {
  const { raceName } = req.body;

  if (!raceName) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const races = db.collection("races");
    const result = await races.insertOne({
      raceName,
    });

    res
      .status(201)
      .json({ message: "Race added successfully", raceId: result.insertedId });
  } catch (error) {
    console.error("Error adding race:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/races", async (req, res) => {
  try {
    const races = db.collection("races");
    const result = await races.find({}).toArray();

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching races:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/races/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const races = db.collection("races");
    const result = await races.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Race deleted successfully" });
    } else {
      res.status(404).json({ message: "Race not found" });
    }
  } catch (error) {
    console.error("Error deleting race:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.patch("/api/races/:id", async (req, res) => {
  const { id } = req.params;
  const { raceName } = req.body;

  if (!raceName) {
    return res.status(400).json({ message: "Race name is required" });
  }

  try {
    const races = db.collection("races");
    const result = await races.updateOne(
      { _id: new ObjectId(id) },
      { $set: { raceName } }
    );

    if (result.modifiedCount === 1) {
      res.status(200).json({ message: "Race updated successfully" });
    } else {
      res.status(404).json({ message: "Race not found" });
    }
  } catch (error) {
    console.error("Error updating race:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
