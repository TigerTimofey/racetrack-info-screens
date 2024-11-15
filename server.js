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

// ADD RACES
app.post("/api/races", async (req, res) => {
  const {
    raceName,
    raceDrivers,
    carAssignment,
    raceTime,
    raceFlags,
    lapTimes,
    startTime,
    raceMode,
    participants,
    safetyBriefingStatus,
    paddockAssignment,
  } = req.body;

  if (!raceName) {
    return res.status(400).json({ message: "Race Name are required" });
  }

  const raceData = {
    raceName,
    raceDrivers: Array.isArray(raceDrivers) ? raceDrivers : [],
    carAssignment: carAssignment || [],
    raceTime: raceTime || null,
    raceFlags: raceFlags || null,
    lapTimes: lapTimes || [],
    startTime: startTime || null,
    raceMode: raceMode || "Pending",
    participants,
    safetyBriefingStatus: safetyBriefingStatus || false,
    paddockAssignment: paddockAssignment || {},
  };

  try {
    const races = db.collection("races");
    const result = await races.insertOne(raceData);

    res
      .status(201)
      .json({ message: "Race added successfully", raceId: result.insertedId });
  } catch (error) {
    console.error("Error adding race:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET ALL RACES
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

// GET SPECIFIC RACE
app.get("/api/races/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const races = db.collection("races");
    const race = await races.findOne({ _id: new ObjectId(id) });

    if (race) {
      res.status(200).json(race);
    } else {
      res.status(404).json({ message: "Race not found" });
    }
  } catch (error) {
    console.error("Error fetching race:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//DELETE RACE
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

// PATCH RACE (update any race fields)
app.patch("/api/races/:id", async (req, res) => {
  const { id } = req.params;
  const {
    raceName,
    raceDrivers,
    carAssignment,
    raceTime,
    raceFlags,
    lapTimes,
    startTime,
    raceMode,
    participants,
    safetyBriefingStatus,
    paddockAssignment,
  } = req.body;

  try {
    const races = db.collection("races");

    let updateFields = {};
    if (raceName) updateFields.raceName = raceName;
    if (raceDrivers) updateFields.raceDrivers = raceDrivers;
    if (carAssignment) updateFields.carAssignment = carAssignment;
    if (raceTime) updateFields.raceTime = raceTime;
    if (raceFlags) updateFields.raceFlags = raceFlags;
    if (lapTimes) updateFields.lapTimes = lapTimes;
    if (startTime) updateFields.startTime = startTime;
    if (raceMode) updateFields.raceMode = raceMode;
    if (participants) updateFields.participants = participants;
    if (safetyBriefingStatus)
      updateFields.safetyBriefingStatus = safetyBriefingStatus;
    if (paddockAssignment) updateFields.paddockAssignment = paddockAssignment;

    const result = await races.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
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
