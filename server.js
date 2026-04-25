const express = require('express');
const app = express();

// TRACK ENDPOINT
app.get("/track", async (req, res) => {
  // SADECE İLK IP'Yİ AL
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded ? forwarded.split(",")[0].trim() : req.socket.remoteAddress;
  
  const ua = req.headers["user-agent"];
  
  // Coğrafi veri
  let city = "-", country = "-", isp = "-";
  try {
    const geo = await fetch(`http://ip-api.com/json/${ip}?fields=city,country,isp`).then(r => r.json());
    city = geo.city || "-";
    country = geo.country || "-";
    isp = geo.isp || "-";
  } catch(e) {
    console.log("Geo API hatası:", e.message);
  }
  
  // Tarih (doğru format)
  const now = new Date();
  const time = `${now.getDate().toString().padStart(2,'0')}.${(now.getMonth()+1).toString().padStart(2,'0')}.${now.getFullYear()} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
  
  const msg = `🚗 QR TARANDI

🌍 IP: ${ip}
📍 Şehir: ${city}
🌎 Ülke: ${country}
📡 ISP: ${isp}

📱 Cihaz: ${ua}

⏰ Saat: ${time}`;

  try {
    await fetch(`https://api.telegram.org/bot8381262942:AAGb0yeCVcl4-IPL_dAhxm7lOjdE7DEKTaA/sendMessage`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({chat_id: "8706199771", text: msg})
    });
  } catch(e) {
    console.log("Telegram hatası:", e.message);
  }
  
  res.send("OK");
});

// Health check için (zorunlu değil ama iyi olur)
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Sunucuyu başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
