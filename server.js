const express = require('express');
const app = express();

app.use(express.json());

// GET isteğini işle
app.get("/track", async (req, res) => {
  try {
    // 1. IP adresini al
    const forwarded = req.headers["x-forwarded-for"];
    const ip = forwarded ? forwarded.split(",")[0].trim() : req.socket.remoteAddress;
    
    // 2. User Agent
    const ua = req.headers["user-agent"];
    
    // 3. Cihaz saatini al (HİÇBİR DÖNÜŞÜM YAPMA)
    let deviceTimeFormatted = "Bilinmiyor";
    let timezone = "Bilinmiyor";
    
    if (req.query.deviceTime) {
      const deviceTime = new Date(req.query.deviceTime);
      
      // Direkt cihazın gönderdiği değeri kullan
      const day = String(deviceTime.getDate()).padStart(2, '0');
      const month = String(deviceTime.getMonth() + 1).padStart(2, '0');
      const year = deviceTime.getFullYear();
      const hours = String(deviceTime.getHours()).padStart(2, '0');
      const minutes = String(deviceTime.getMinutes()).padStart(2, '0');
      const seconds = String(deviceTime.getSeconds()).padStart(2, '0');
      deviceTimeFormatted = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
      timezone = req.query.timezone || "Bilinmiyor";
      
      // Debug için konsola yaz
      console.log(`📥 Gelen IP: ${ip}`);
      console.log(`📥 Gelen saat (raw): ${req.query.deviceTime}`);
      console.log(`📥 Formatlanmış saat: ${deviceTimeFormatted}`);
      console.log(`📥 Zaman dilimi: ${timezone}`);
    }
    
    // 4. Coğrafi veri (ip-api.com)
    let city = "-", country = "-", isp = "-";
    try {
      const geo = await fetch(`http://ip-api.com/json/${ip}?fields=city,country,isp`);
      const data = await geo.json();
      if (data.city) city = data.city;
      if (data.country) country = data.country;
      if (data.isp) isp = data.isp;
      console.log(`📍 Konum: ${city}, ${country} | ISP: ${isp}`);
    } catch(e) {
      console.log("Coğrafi API hatası:", e.message);
    }
    
    // 5. Telegram mesajını oluştur
    const msg = `🚗 QR TARANDI

🌍 IP: ${ip}
📍 Şehir: ${city}
🌎 Ülke: ${country}
📡 ISP: ${isp}

📱 Cihaz: ${ua}

⏰ Cihaz Saati: ${deviceTimeFormatted}
🌐 Zaman Dilimi: ${timezone}`;

    // 6. Telegram'a gönder (BOT_TOKEN'ını değiştir!)
    const botToken = "***"; // Bot token'ını buraya yaz
    const chatId = "8706199771";
    
    await fetch(`https://api.telegram.org/bot8381262942:AAGb0yeCVcl4-IPL_dAhxm7lOjdE7DEKTaA/sendMessage`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        chat_id: 8706199771,
        text: msg
      })
    });
    
    console.log("✅ Telegram'a gönderildi");
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

// Sunucuyu başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Track endpoint: http://localhost:${PORT}/track`);
});
