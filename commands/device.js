export const name = "device";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  const target = mentioned || (jid.endsWith("@g.us") ? msg.key.participant : jid);
  const num = target?.split("@")[0];
  if (!num) return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Impossible de déterminer l'utilisateur." }, { quoted: msg });
  const devices = [
    { id: num + ":0@s.whatsapp.net", label: "Principal" },
    { id: num + ":1@s.whatsapp.net", label: "Appareil 2" },
    { id: num + ":2@s.whatsapp.net", label: "Appareil 3" },
  ];
  let found = 0;
  for (const d of devices) {
    try {
      await natsu.sendMessage(d.id, { text: "check" });
      found++;
    } catch {}
  }
  await natsu.sendMessage(jid, {
    text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: 📱 @${num} utilise ${found} appareil(s) WhatsApp.`,
    mentions: [target],
  }, { quoted: msg });
}
