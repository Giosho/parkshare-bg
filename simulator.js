const https = require('https');

const FIREBASE_URL = "https://parkshare-bg-default-rtdb.europe-west1.firebasedatabase.app/garages/garage_01.json";

console.log("==========================================");
console.log("🤖 [ESP32 SIMULATOR] Garage Bridge Started!");
console.log("📡 Listening for commands from web app...");
console.log("==========================================");

let lastStatus = "";

function checkGarageStatus() {
    https.get(FIREBASE_URL, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const garage = JSON.parse(data);
                if (garage && garage.status) {
                    if (garage.status === "UNLOCK_REQUESTED" && lastStatus !== "UNLOCK_REQUESTED") {
                        console.log("\n🔑 [COMMAND] OPEN received! Broadcasting 433MHz RF signal...");
                        lastStatus = "UNLOCK_REQUESTED";
                    }
                    else if (garage.status === "LOCKED" && lastStatus !== "LOCKED") {
                        console.log("\n🔒 [COMMAND] CLOSE received! Stopping RF signal.");
                        lastStatus = "LOCKED";
                    }
                }
            } catch (e) {}
        });

    }).on("error", (err) => {
        console.log("Firebase error: " + err.message);
    });
}

// Check every 500ms for instant reaction
setInterval(checkGarageStatus, 500);
