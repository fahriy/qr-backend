const express = require('express');
const app = express();
app.use(express.json());

// 📌 HEM GET hem POST destekle
app.get("/track", async (req, res) => {
  await handleRequest(req, res);
});

app.post("/track", async (req, res) => {
  await handleRequest(req, res);
});

// Ortak işlem fonksiyonu
async function handleRequest(req, res) {
  try {
    // 1. IP adresini al
    const forwarded = req.headers["x-forwarded-for"];
    const ip = forwarded ? forwarded.split(",")[0].trim() : req.socket.remoteAddress;
    
    // 2. User Agent
    const ua = req.headers["user-agent"];
    
    // 3. Cihaz saatini al (GET'te query'den, POST'ta body'den)
    let deviceTimeFormatted = "Bilinmiyor";
    let timezone = "Bilinmiyor";
    
    let deviceTimeRaw = req.query.deviceTime || req.body?.deviceTime;
    let timezoneRaw = req.query.timezone || req.body?.timezone;
    
    if (deviceTimeRaw) {
      const deviceTime = new Date(deviceTimeRaw);
      const day = String(deviceTime.getDate()).padStart(2, '0');
      const month = String(deviceTime.getMonth() + 1).padStart(2, '0');
      const year = deviceTime.getFullYear();
      const hours = String(deviceTime.getHours()).padStart(2, '0');
      const minutes = String(deviceTime.getMinutes()).padStart(2, '0');
      const seconds = String(deviceTime.getSeconds()).padStart(2, '0');
      deviceTimeFormatted = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
      timezone = timezoneRaw || "Bilinmiyor";
    }
    
    // 4. Coğrafi veri
    let city = "-", country = "-", isp = "-";
    try {
      const geo = await fetch(`http://ip-api.com/json/${ip}?fields=city,country,isp`);
      const data = await geo.json();
      if (data.city) city = data.city;
      if (data.country) country = data.country;
      if (data.isp) isp = data.isp;
    } catch(e) {
      console.log("Coğrafi API hatası:", e.message);
    }
    
    // 5. Telegram mesajı
    const msg = `🚗 QR TARANDI

🌍 IP: ${ip}
📍 Şehir: ${city}
🌎 Ülke: ${country}
📡 ISP: ${isp}

📱 Cihaz: ${ua}

⏰ Cihaz Saati: ${deviceTimeFormatted}
🌐 Zaman Dilimi: ${timezone}`;

    // 6. Telegram'a gönder (BOT_TOKEN'ını değiştir!)
    await fetch(`https://api.telegram.org/bot***/sendMessage`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        chat_id: "8706199771",
        text: msg
      })
    });
    
    console.log("Mesaj gönderildi:", ip);
    res.send("OK");
    
  } catch (error) {
    console.error("Hata:", error.message);
    res.status(500).send("Error");
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
