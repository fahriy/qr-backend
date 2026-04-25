app.get("/track", async (req, res) => {

  const rawIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const ip = rawIp.split(",")[0].trim();

  const ua = req.headers["user-agent"];

  const geo = await fetch(`https://ipapi.co/${ip}/json/`)
    .then(r => r.json())
    .catch(() => ({}));

  const time = new Date().toLocaleString("tr-TR", {
    timeZone: "Europe/Istanbul"
  });

  const msg = `
🚗 QR TARANDI

🌍 IP: ${ip}
📍 Şehir: ${geo.city || "-"}
🌎 Ülke: ${geo.country_name || "-"}
📡 ISP: ${geo.org || "-"}

📱 Cihaz: ${ua}

⏰ Saat: ${time}
`;

  await fetch(`https://api.telegram.org/bot8381262942:AAGb0yeCVcl4-IPL_dAhxm7lOjdE7DEKTaA/sendMessage`, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      chat_id: "8706199771",
      text: msg
    })
  });

  res.send("OK");
});
