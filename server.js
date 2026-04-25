const express = require('express');
const app = express();

app.get("/track", async (req, res) => {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded ? forwarded.split(",")[0].trim() : req.socket.remoteAddress;
  
  const ua = req.headers["user-agent"];
  
  let city = "-", country = "-", isp = "-";
  try {
    const geo = await fetch(`http://ip-api.com/json/${ip}?fields=city,country,isp`).then(r => r.json());
    city = geo.city || "-";
    country = geo.country || "-";
    isp = geo.isp || "-";
  } catch(e) {}
  
  // ✅ DÜZELTİLMİŞ TARİH (2026 -> 2025)
  const now = new Date();
  now.setFullYear(now.getFullYear() - 1); // Render saati 1 yıl ileride
  const time = `${now.getDate().toString().padStart(2,'0')}.${(now.getMonth()+1).toString().padStart(2,'0')}.${now.getFullYear()} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
  
  const msg = `🚗 QR TARANDI

🌍 IP: ${ip}
📍 Şehir: ${city}
🌎 Ülke: ${country}
📡 ISP: ${isp}

📱 Cihaz: ${ua}

⏰ Saat: ${time}`;

  await fetch(`https://api.telegram.org/bot8381262942:AAGb0yeCVcl4-IPL_dAhxm7lOjdE7DEKTaA/sendMessage`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({chat_id: "8706199771", text: msg})
  });
  
  res.send("OK");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
