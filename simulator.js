const https = require('https');

const FIREBASE_URL = "https://parkshare-bg-default-rtdb.europe-west1.firebasedatabase.app/garages/garage_01.json";

console.log("==========================================");
console.log("🤖 [ESP32 SIMULATOR] Garage Bridge Started!");
console.log("📡 Listening for commands from web app...");
console.log("==========================================");

let lastStatus = "";

function checkGarageStatus() {
    let scheduled = false;
    const next = () => {
        if (scheduled) return;
        scheduled = true;
        setTimeout(checkGarageStatus, 500);
    };

    const req = https.get(FIREBASE_URL, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const garage = JSON.parse(data);
                if (garage && garage.status && garage.status !== lastStatus) {
                    if (garage.status === "UNLOCK_REQUESTED") {
                        console.log("\n🔑 [COMMAND] OPEN received! Broadcasting 433MHz RF signal...");
                    } else if (garage.status === "LOCKED") {
                        console.log("\n🔒 [COMMAND] CLOSE received! Stopping RF signal.");
                    } else {
                        console.log("\n❓ Unknown status: " + garage.status);
                    }
                    lastStatus = garage.status;
                }
            } catch (e) {}
            next();
        });
    });

    req.on("error", (err) => {
        console.log("Firebase error: " + err.message);
        next();
    });

    req.setTimeout(3000, () => req.destroy(new Error("timeout")));
}

// One request at a time, next poll 500ms after the previous one finishes
checkGarageStatus();
