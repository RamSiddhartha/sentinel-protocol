const express = require("express");
const redis = require("redis");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// 1. Redis Client (Her Purpose: Blocking)
const redisClient = redis.createClient();
redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect().then(() => console.log("✅ Connected to Redis"));

// 2. MongoDB Schema (Your Purpose: Detailed Logging)
const logSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  clientIP: String,
  endpoint: String,
  method: String,
  statusCode: Number,
  apiToken: String,
  responseTime: Number
});
const Log = mongoose.model("Log", logSchema);

mongoose.connect("mongodb+srv://sentinel_db:h0oMTt60F0kXDdEQ@sentinellogs.0d8oswy.mongodb.net/sentinel")
  .then(() => console.log("✅ Connected to MongoDB (Sentinel DB)"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// 3. SECURITY CHECK (Her Logic)
app.use(async (req, res, next) => {
  try {
    const blockedIP = await redisClient.get(`block:ip:${req.ip}`);
    if (blockedIP) return res.status(403).send("🚫 Blocked by Sentinel Security");
    next(); 
  } catch (error) {
    next(); 
  }
});

// 4. TRAFFIC LOGGING (Your Logic)
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", async () => {
    try {
      const log = new Log({
        clientIP: req.ip,
        endpoint: req.path,
        method: req.method,
        statusCode: res.statusCode,
        responseTime: Date.now() - start
      });
      await log.save();
      console.log(`📥 Logged: ${req.method} ${req.path} [${res.statusCode}]`);
    } catch (err) {
      console.error("Logging Error:", err);
    }
  });
  next();
});

// 5. API Routes
app.get("/api/balance", (req, res) => res.status(200).json({ balance: 5000 }));
app.get("/api/history", async (req, res) => {
  const history = await Log.find().sort({ timestamp: -1 }).limit(10);
  res.status(200).json(history);
});

app.listen(3000, () => console.log("🚀 Sentinel API is LIVE on port 3000"));