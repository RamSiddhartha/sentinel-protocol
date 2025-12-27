require('dotenv').config(); // Load the .env file
const mongoose = require('mongoose');

// Use the secret string from your .env file
const DB_URL = process.env.MONGO_URI;

mongoose.connect(DB_URL)
  .then(() => console.log("Success: Connected to MongoDB Atlas!"))
  .catch((err) => console.error("Database connection error:", err));
const express = require('express');

const Log = require('./models/Log'); // This imports your blueprint

const app = express();
app.use(express.json());

// 1. THE SECURITY CAMERA (Middleware)
app.use(async (req, res, next) => {
    const start = Date.now();

    // This waits for the response to finish before saving the log
    res.on('finish', async () => {
        const duration = Date.now() - start;
        try {
            await Log.create({
                clientIP: req.ip,
                endpoint: req.originalUrl,
                method: req.method,
                statusCode: res.statusCode,
                apiToken: req.headers['x-api-key'] || 'anonymous',
                responseTime: duration
            });
            console.log(`Log saved: ${req.method} ${req.originalUrl} [${res.statusCode}]`);
        } catch (err) {
            console.error("Failed to save log:", err);
        }
    });
    next();
});

// 2. THE MOCK API ENDPOINTS
app.get('/api/balance', (req, res) => {
    res.json({ account: "Savings", balance: 5000 });
});

app.post('/api/transaction', (req, res) => {
    res.json({ status: "Success", message: "Money sent!" });
});

app.get('/api/history', (req, res) => {
    res.json({ transactions: ["Rent: -$1000", "Salary: +$3000"] });
});

// 3. START THE SERVER
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Sentinel API is live on http://localhost:${PORT}`);
});