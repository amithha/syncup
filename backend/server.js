const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const redis = require("redis");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

redisClient.connect();

const FeedSchema = new mongoose.Schema({
  message: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Feed = mongoose.model("Feed", FeedSchema);

app.get("/feed", async (req, res) => {
  try {
    const cached = await redisClient.get("feeds");

    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const feeds = await Feed.find().sort({ createdAt: -1 });

    await redisClient.set("feeds", JSON.stringify(feeds));

    res.json(feeds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/feed", async (req, res) => {
  try {
    const newFeed = await Feed.create({
      message: req.body.message,
    });

    await redisClient.del("feeds");

    io.emit("new-feed", newFeed);

    res.json(newFeed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/feed/:id", async (req, res) => {
  try {
    await Feed.findByIdAndDelete(req.params.id);

    await redisClient.del("feeds");

    io.emit("delete-feed", req.params.id);

    res.json({
      message: "Feed deleted",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});