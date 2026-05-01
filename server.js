const express = require('express');
const app = express();

// CORS ayarları
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
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
    
    // 3. Cihaz saatini al (HTML'den gelen formatlanmış saat)
    let deviceTimeFormatted = "Bilinmiyor";
    let timezone = "Bilinmiyor";
    
    if (req.query.deviceTime) {
      deviceTimeFormatted = req.query.deviceTime;
      timezone = req.query.timezone || "Bilinmiyor";
    }
    
    // 4. KULLANICI BİLGİLERİNİ AL (formdan gelenler)
    const userName = req.query.user_name || "";
    const userPhone = req.query.user_phone || "";
    const ownerPhone = req.query.owner_phone || "";
    const action = req.query.action || "";
    
    // 5. Coğrafi veri (ip-api.com)
    let city = "-", country = "-", isp = "-";
    try {
      const geo = await fetch(`http://ip-api.com/json/${ip}?fields=city,country,isp`);
      const data = await geo.json();
      city = data.city || "-";
      country = data.country || "-";
      isp = data.isp || "-";
      console.log(`📍 Konum: ${city}, ${country} | ISP: ${isp}`);
    } catch(e) {
      console.log("Coğrafi API hatası:", e.message);
    }
    
    // 6. OLAY TÜRÜNE GÖRE MESAJ OLUŞTUR
    let msg = "";
    
    if (userName && userPhone) {
      // ARANMA TALEBİ (form gönderildi)
      msg = `📞 ARANMA TALEBİ

👤 İsim: ${userName}
📱 Telefon: ${userPhone}
🚗 Aranacak Numara: ${ownerPhone}
🎯 İşlem: ${action}

🌍 IP: ${ip}
📍 Şehir: ${city}
🌎 Ülke: ${country}
📡 ISP: ${isp}

📱 Cihaz: ${ua}
⏰ Cihaz Saati: ${deviceTimeFormatted}
🌐 Zaman Dilimi: ${timezone}`;
      
      console.log(`📞 ARANMA TALEBİ - İsim: ${userName}, Telefon: ${userPhone}`);
      
    } else {
      // QR TARANDI (sayfa açılış)
      msg = `🚗 QR TARANDI

🌍 IP: ${ip}
📍 Şehir: ${city}
🌎 Ülke: ${country}
📡 ISP: ${isp}

📱 Cihaz: ${ua}

⏰ Cihaz Saati: ${deviceTimeFormatted}
🌐 Zaman Dilimi: ${timezone}`;
      
      console.log(`🚗 QR TARANDI - IP: ${ip}`);
    }
    
    // 7. Telegram'a gönder
    const botToken = "8381262942:AAG9HIBIHWpNQlGH2yZ6m0LQ22-19xRTtD4";
    const chatId = "8706199771";
    
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        chat_id: chatId,
        text: msg
      })
    });
    
    if (telegramResponse.ok) {
      console.log("✅ Telegram'a gönderildi");
    } else {
      console.log("❌ Telegram hatası:", await telegramResponse.text());
    }
    
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
