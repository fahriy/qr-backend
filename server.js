const express = require('express');
const app = express();

// CORS ayarları (TÜM domainlere izin ver)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // OPTIONS isteklerine hemen cevap ver
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// GET isteğini işle
app.get("/track", async (req, res) => {
  try {
    // 1. IP adresini al
    const forwarded = req.headers["x-forwarded-for"];
    const ip = forwarded ? forwarded.split(",")[0].trim() : req.socket.remoteAddress;
    
    // 2. User Agent
    const ua = req.headers["user-agent"];
    
    // 3. Cihaz saatini al
    let deviceTimeFormatted = "Bilinmiyor";
    let timezone = "Bilinmiyor";
    
    if (req.query.deviceTime) {
      let deviceTime = new Date(req.query.deviceTime);
      
      // 1 gün ekle (geçici çözüm)
      deviceTime.setDate(deviceTime.getDate() + 1);
      
      const day = String(deviceTime.getDate()).padStart(2, '0');
      const month = String(deviceTime.getMonth() + 1).padStart(2, '0');
      const year = deviceTime.getFullYear();
      const hours = String(deviceTime.getHours()).padStart(2, '0');
      const minutes = String(deviceTime.getMinutes()).padStart(2, '0');
      const seconds = String(deviceTime.getSeconds()).padStart(2, '0');
      deviceTimeFormatted = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
      timezone = req.query.timezone || "Bilinmiyor";
      
      console.log(`📥 Gelen IP: ${ip}`);
      console.log(`📥 Formatlanmış saat: ${deviceTimeFormatted}`);
    }
    
    // 4. Coğrafi veri
    let city = "-", country = "-", isp = "-";
    try {
      const geo = await fetch(`http://ip-api.com/json/${ip}?fields=city,country,isp`);
      const data = await geo.json();
      city = data.city || "-";
      country = data.country || "-";
      isp = data.isp || "-";
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
    const botToken = "***"; // Bot token'ını buraya yaz
    const chatId = "8706199771";
    
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        chat_id: chatId,
        text: msg
      })
    });
    
    console.log("✅ Telegram'a gönderildi");
    res.status(200).send("OK");
    
  } catch (error) {
    console.error("❌ Hata:", error.message);
    res.status(500).send("Error");
  }
});

// OPTIONS istekleri için
app.options("/track", (req, res) => {
  res.sendStatus(200);
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
  console.log(`✅ CORS enabled for all origins`);
});
