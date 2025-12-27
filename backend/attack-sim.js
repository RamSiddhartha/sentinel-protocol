const axios = require('axios');

async function simulateAttack() {
    console.log("⚠️ Simulating Brute-Force Attack...");
    
    for (let i = 0; i < 15; i++) {
        try {
            // This represents a user hitting the login endpoint with bad credentials
            await axios.post('http://localhost:3000/api/login', {
                username: "admin",
                password: "wrong_password_" + i
            });
        } catch (error) {
            // We expect an error (401 Unauthorized)
            console.log(`❌ Failed attempt ${i + 1} logged`);
        }
    }
    console.log("🏁 Attack simulation complete. Check Atlas for failed logs!");
}

simulateAttack();