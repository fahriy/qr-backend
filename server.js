const express = require("express");
const app = express();

app.get("/track", async (req, res) => {

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const ua = req.headers["user-agent"];

  const geo = await fetch(`https://ipapi.co/${ip}/json/`)
    .then(r => r.json())
    .catch(() => ({}));

  const msg = `
🚗 QR TARANDI

🌍 IP: ${ip}
📍 Şehir: ${geo.city || "-"}
🌎 Ülke: ${geo.country_name || "-"}
📡 ISP: ${geo.org || "-"}

📱 Cihaz: ${ua}

⏰ Saat: ${new Date().toLocaleString()}
`;

  await fetch(`https://api.telegram.org/botBOT_TOKEN/sendMessage`, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      chat_id: "CHAT_ID",
      text: msg
    })
  });

  res.send("OK");
});

app.listen(3000);
