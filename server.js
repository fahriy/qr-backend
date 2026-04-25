app.get("/track", async (req, res) => {
  try {
    // 1. IP düzeltme
    let rawIp = req.headers["cf-connecting-ip"] ||
                req.headers["x-forwarded-for"] ||
                req.socket.remoteAddress;
    
    if (Array.isArray(rawIp)) rawIp = rawIp[0];
    if (rawIp.includes(",")) rawIp = rawIp.split(",")[0];
    
    const ip = String(rawIp).replace("::ffff:", "").trim();

    // 2. User Agent
    const ua = req.headers["user-agent"];

    // 3. Coğrafi veri (ip-api.com daha güvenilir)
    let geo = {};
    try {
      const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,isp,query`);
      geo = await response.json();
      if (geo.status !== "success") geo = {};
    } catch (err) {
      console.error("Geo API error:", err.message);
    }

    // 4. Tarih düzeltme
    const now = new Date();
    const time = now.toLocaleString("tr-TR", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });

    // 5. Mesaj formatı
    const msg = `
🚗 QR TARANDI

🌍 IP: ${ip}
📍 Şehir: ${geo.city || "-"}
🌎 Ülke: ${geo.country || "-"}
📡 ISP: ${geo.isp || "-"}

📱 Cihaz: ${ua || "-"}

⏰ Saat: ${time}
`;

    // 6. Telegram'a gönder
    await fetch(`https://api.telegram.org/bot8381262942:AAGb0yeCVcl4-IPL_dAhxm7lOjdE7DEKTaA/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: "8706199771",
        text: msg
      })
    });

    res.send("OK");
  } catch (error) {
    console.error("Hata:", error.message);
    res.status(500).send("Error");
  }
});
