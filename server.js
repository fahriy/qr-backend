app.get("/track", async (req, res) => {

  const rawIp =
    req.headers["cf-connecting-ip"] ||
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress;

  const ip = String(rawIp).split(",")[0].replace("::ffff:", "").trim();

  const ua = req.headers["user-agent"];

  const geo = await fetch(`https://ipwho.is/${ip}`)
    .then(r => r.json())
    .catch(() => ({}));

  const time = new Date().toLocaleString("tr-TR", {
    timeZone: "Europe/Istanbul"
  });

  const msg = `
🚗 QR TARANDI

🌍 IP: ${ip}
📍 Şehir: ${geo.city || "-"}
🌎 Ülke: ${geo.country || "-"}
📡 ISP: ${geo.connection?.isp || "-"}

📱 Cihaz: ${ua}

⏰ Saat: ${time}
`;

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
