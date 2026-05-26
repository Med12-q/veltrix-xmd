export const name = "pin";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Commande de groupe uniquement." }, { quoted: msg });
  const quoted = msg.message?.extendedTextMessage?.contextInfo;
  if (!quoted?.stanzaId) return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Réponds au message à épingler." }, { quoted: msg });
  try {
    const dur = args[0] === "7d" ? 604800 : args[0] === "24h" ? 86400 : 2592000;
    await natsu.sendMessage(jid, {
      pin: { type: 1, time: dur },
      key: { remoteJid: jid, id: quoted.stanzaId, participant: quoted.participant },
    });
    await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: 📌 Message épinglé !" }, { quoted: msg });
  } catch { await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: ❌ Impossible d'épingler." }, { quoted: msg }); }
}
