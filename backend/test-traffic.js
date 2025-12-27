const axios = require('axios'); // You may need to run: npm install axios

async function simulateTraffic() {
    console.log("🚀 Starting traffic simulation...");
    
    for (let i = 0; i < 50; i++) {
        try {
            // This sends a "GET" request to your live balance API
            await axios.get('http://localhost:3000/api/balance');
            console.log(`✅ Log ${i + 1} sent to MongoDB`);
        } catch (error) {
            console.error("❌ Request failed. Is your server.js running?");
        }
    }
    console.log("🏁 Done! 50 logs have been generated.");
}

simulateTraffic();