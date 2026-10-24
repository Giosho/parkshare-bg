const https = require('https');

const FIREBASE_URL = "https://parkshare-bg-default-rtdb.europe-west1.firebasedatabase.app/garages/garage_01.json";

console.log("==========================================");
console.log("🤖 [ESP32 SIMULATOR] Гаражна врата стартирана!");
console.log("📡 Слушане за команди от уеб приложението...");
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
                    // Ако шофьорът е натиснал бутона в сайта
                    if (garage.status === "UNLOCK_REQUESTED" && lastStatus !== "UNLOCK_REQUESTED") {
                        console.log("\n🔑 [СИГНАЛ РЕГИСТРИРАН] Шофьорът натисна бутона в сайта!");
                        console.log("⚙️ [SERVO MOTOR] Задвижване: Вратата се отваря (+90°)...");
                        
                        lastStatus = "UNLOCK_REQUESTED";

                        // Симулираме отворена врата за 5 секунди
                        setTimeout(() => {
                            console.log("⏱️ [ТАЙМЕР] 5 секунди изтекоха.");
                            console.log("⚙️ [SERVO MOTOR] Задвижване: Вратата се затваря (-90°)...");
                            console.log("🔒 [ESP32] Вратата е заключена и готова за следващ клиент.\n");
                            
                            // Връщаме статуса обратно на LOCKED във Firebase
                            updateFirebaseStatus("LOCKED");
                        }, 5000);
                    }
                }
            } catch (e) {
                // Грешки при парсиране се игнорират за стабилност
            }
        });

    }).on("error", (err) => {
        console.log("Грешка при връзка с Firebase: " + err.message);
    });
}

function updateFirebaseStatus(newStatus) {
    const data = JSON.stringify({ status: newStatus });
    const urlObj = new URL(FIREBASE_URL);

    const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname,
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = https.request(options, (res) => {
        res.on('data', () => {});
        res.on('end', () => {
            lastStatus = newStatus;
        });
    });

    req.on('error', (error) => {
        console.error('Грешка при обновяване:', error);
    });

    req.write(data);
    req.end();
}

// Проверява Firebase на всеки 2 секунди
setInterval(checkGarageStatus, 2000);
