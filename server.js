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
    
    // 2. KULLANICI BİLGİLERİ (formdan gelenler)
    const isim = req.query.isim || "-";
    const telefon = req.query.telefon || "-";
    const notMetni = req.query.not || "-";
    const islem = req.query.islem || "-";
    
    // 3. Cihaz bilgileri
    const cihazSaati = req.query.cihaz_saati || "-";
    const zamanDilimi = req.query.zaman_dilimi || "-";
    
    // 4. Telegram mesajını oluştur (sadece istenen bilgiler)
    const msg = `📞 ARANMA TALEBİ

👤 İsim: ${isim}
📞 Telefon: ${telefon}
📝 Not: ${notMetni}
🎯 İşlem: ${islem}

🌍 IP: ${ip}
⏰ Cihaz Saati: ${cihazSaati}
🌐 Zaman Dilimi: ${zamanDilimi}`;
    
    console.log(`📞 ARANMA TALEBİ - İsim: ${isim}, Telefon: ${telefon}`);
    console.log(msg);
    
    // 5. Telegram'a gönder
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
