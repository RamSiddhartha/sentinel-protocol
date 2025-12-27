const mongoose = require("mongoose");
const redis = require("redis");

// 1. Setup Connections
const redisClient = redis.createClient();
redisClient.connect().then(() => console.log("🔍 Detector linked to Redis"));

mongoose.connect("mongodb+srv://sentinel_db:h0oMTt60F0kXDdEQ@sentinellogs.0d8oswy.mongodb.net/sentinel");

// 2. Use your existing Log model structure
const Log = mongoose.model("Log", new mongoose.Schema({
  clientIP: String,
  timestamp: { type: Date, default: Date.now }
}));

// 3. The Detection Logic
async function detectSpam() {
  console.log("🧐 Scanning logs for suspicious activity...");

  // Look back at the last 10 seconds
  const tenSecondsAgo = new Date(Date.now() - 10000);

  // Group logs by IP and count how many requests they made
  const suspectIPs = await Log.aggregate([
    { $match: { timestamp: { $gte: tenSecondsAgo } } },
    { $group: { _id: "$clientIP", count: { $sum: 1 } } },
    { $match: { count: { $gt: 10 } } } // Threshold: more than 10 hits in 10 seconds
  ]);

  for (let suspect of suspectIPs) {
    console.log(`⚠️ ALERT: ${suspect._id} sent ${suspect.count} requests! Blocking...`);
    
    // Tell Redis to block this IP for 1 hour (3600 seconds)
    await redisClient.setEx(`block:ip:${suspect._id}`, 3600, "true");
  }
}

// Run the scanner every 5 seconds
setInterval(detectSpam, 5000);