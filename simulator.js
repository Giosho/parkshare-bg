// simulator.js - ESP32 Gateway Simulator
const admin = require("firebase-admin");

// Твоят URL за базата данни
const DATABASE_URL = "https://parkshare-bg-default-rtdb.europe-west1.firebasedatabase.app";

admin.initializeApp({
  databaseURL: DATABASE_URL
});

const db = admin.database();
const gateRef = db.ref("garages/garage_01");

console.log("==========================================");
console.log("🤖 [ESP32 SIMULATOR] Гаражна врата стартирана!");
console.log("📡 Свързване с Firebase Realtime Database...");
console.log("==========================================\n");

// Ослушване на базата данни за команда
gateRef.on("value", (snapshot) => {
  const data = snapshot.val();
  if (!data) return;

  if (data.status === "UNLOCK_REQUESTED") {
    console.log("🔑 [СИГНАЛ РЕГИСТРИРАН] Шофьорът натисна бутона в уеб приложението!");
    console.log("⚙️ [SERVO MOTOR] Задвижване: Обикновената бариера/врата се отваря (+90°)...");
    
    // Променяме статуса на отворена
    gateRef.update({ status: "OPEN" });

    // Таймер: Вратата стои отворена 5 секунди
    setTimeout(() => {
      console.log("⏱️ [ТАЙМЕР] 5 секунди изтекоха.");
      console.log("⚙️ [SERVO MOTOR] Задвижване: Вратата се затваря (-90°)...");
      gateRef.update({ status: "CLOSED" });
      console.log("🔒 [ESP32] Вратата е заключена и готова за следващо отваряне.\n");
    }, 5000);
  }
});