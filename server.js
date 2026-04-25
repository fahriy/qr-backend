const express = require("express");
const app = express();

app.use(express.json());

const BOT = "8381262942:AAGb0yeCVcl4-IPL_dAhxm7lOjdE7DEKTaA";
const CHAT = "8706199771";

app.get("/track", async (req, res) => {

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const geo = await fetch(`https://ipapi.co/${ip}/json/`)
    .then(r => r.json())
    .catch(() => ({}));

  await fetch(`https://api.telegram.org/bot${BOT}/sendMessage`, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      chat_id: CHAT,
      text:
`🚗 QR TARANDI
IP: ${ip}
Şehir: ${geo.city || "unknown"}
Ülke: ${geo.country_name || "unknown"}`
    })
  });

  res.send("OK");
});

app.listen(3000);
