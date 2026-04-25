app.get("/track", async (req, res) => {
  // KESİN ÇÖZÜM: SADECE ilk IP'yi al
  let ip = req.headers["x-forwarded-for"];
  
  if (ip) {
    // Eğer birden fazla IP varsa (virgülle ayrılmış), ilkini al
    ip = ip.split(",")[0].trim();
  } else {
    // Fallback: direkt bağlantı IP'si
    ip = req.socket.remoteAddress;
  }
  
  // IPv6 prefix'ini temizle
  ip = ip.replace("::ffff:", "");
  
  // User Agent
  const ua = req.headers["user-agent"];
  
  // Coğrafi veri (ip-api.com çalışan bir API)
  let geo = {};
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,isp`);
    const data = await response.json();
    if (data.status === "success") {
      geo = {
        city: data.city,
        country: data.country,
        isp: data.isp
      };
    }
  } catch (err) {
    console.log("Coğrafi API hatası:", err.message);
  }
  
  // Tarih (DOĞRU format)
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const time = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
  
  // Telegram mesajı
  const msg = `
🚗 QR TARANDI

🌍 IP: ${ip}
📍 Şehir: ${geo.city || "-"}
🌎 Ülke: ${geo.country || "-"}
📡 ISP: ${geo.isp || "-"}

📱 Cihaz: ${ua}

⏰ Saat: ${time}
`;

  // Telegram'a gönder
  await fetch(`https://api.telegram.org/bot8381262942:AAGb0yeCVcl4-IPL_dAhxm7lOjdE7DEKTaA/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: "8706199771",
      text: msg
    })
  });
  
  res.send("OK");
});
