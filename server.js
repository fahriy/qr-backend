const express = require('express');
const app = express();

app.use(express.json());

// GET isteğini işle
app.get("/track", async (req, res) => {
  try {
    // IP adresi
    const forwarded = req.headers["x-forwarded-for"];
    const ip = forwarded ? forwarded.split(",")[0].trim() : req.socket.remoteAddress;
    
    // User Agent
    const ua = req.headers["user-agent"];
    
    // Cihaz saatini query'den al
    let deviceTimeFormatted = "Bilinmiyor";
    let timezone = "Bilinmiyor";
    
    if (req.query.deviceTime) {
      const deviceTime = new Date(req.query.deviceTime);
      const day = String(deviceTime.getDate()).padStart(2, '0');
      const month = String(deviceTime.getMonth() + 1).padStart(2, '0');
      const year = deviceTime.getFullYear();
      const hours = String(deviceTime.getHours()).padStart(2, '0');
      const minutes = String(deviceTime.getMinutes()).padStart(2, '0');
      const seconds = String(deviceTime.getSeconds()).padStart(2, '0');
      deviceTimeFormatted = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
      timezone = req.query.timezone || "Bilinmiyor";
    }
    
    // Coğrafi veri
    let city = "-", country = "-", isp = "-";
    try {
      const geo = await fetch(`http://ip-api.com/json/${ip}?fields=city,country,isp`);
      const data = await geo.json();
      city = data.city || "-";
      country = data.country || "-";
      isp = data.isp || "-";
    } catch(e) {}
    
    // Telegram mesajı
    const msg = `🚗 QR TARANDI

🌍 IP: ${ip}
📍 Şehir: ${city}
🌎 Ülke: ${country}
📡 ISP: ${isp}

📱 Cihaz: ${ua}

⏰ Cihaz Saati: ${deviceTimeFormatted}
🌐 Zaman Dilimi: ${timezone}`;

    // Telegram'a gönder (BOT_TOKEN'ını değiştir!)
    await fetch(`https://api.telegram.org/bot8381262942:AAGb0yeCVcl4-IPL_dAhxm7lOjdE7DEKTaA/sendMessage`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        chat_id: "8706199771",
        text: msg
      })
    });
    
    console.log("✅ Mesaj gönderildi - IP:", ip, "Saat:", deviceTimeFormatted);
    res.send("OK");
    
  } catch (error) {
    console.error("❌ Hata:", error.message);
    res.status(500).send("Error");
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
