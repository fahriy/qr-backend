app.get("/track", async (req, res) => {
  try {
    // 1. Render'da gerçek IP'yi al - SIRALAMA ÖNEMLİ!
    const ip = req.headers["true-client-ip"] ||           // Render'ın gerçek IP'si
               req.headers["cf-connecting-ip"] ||        // Cloudflare
               (req.headers["x-forwarded-for"]?.split(",")[0].trim()) || // fallback
               req.socket.remoteAddress;
    
    console.log("Alınan IP:", ip); // Şimdi doğru IP'yi görmelisiniz

    // 2. User Agent
    const ua = req.headers["user-agent"];

    // 3. Coğrafi veri - ip-api.com daha hızlı ve ücretsiz
    let geo = {};
    try {
      const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,isp,query`);
      const data = await response.json();
      if (data.status === "success") {
        geo = {
          city: data.city,
          country: data.country,
          isp: data.isp
        };
      }
    } catch (err) {
      console.error("Geo API hatası:", err.message);
    }

    // 4. Tarih - Sunucu saati yanlışsa bunu kullan
    const now = new Date();
    const time = now.toLocaleString("tr-TR", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });

    // 5. Mesaj - Telegram'a gönder
    const msg = `
🚗 QR TARANDI

🌍 IP: ${ip}
📍 Şehir: ${geo.city || "-"}
🌎 Ülke: ${geo.country || "-"}
📡 ISP: ${geo.isp || "-"}

📱 Cihaz: ${ua || "-"}

⏰ Saat: ${time}
`;

    console.log("Gönderilen mesaj:", msg); // Debug için

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
