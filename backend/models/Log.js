const mongoose = require('mongoose');

// This defines WHAT the "Security Camera" records
const logSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    clientIP: String,
    endpoint: String,
    method: String,
    statusCode: Number,
    apiToken: String,
    responseTime: Number
});

module.exports = mongoose.model('Log', logSchema);