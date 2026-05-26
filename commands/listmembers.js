export const name = "listmembers";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Commande de groupe uniquement." }, { quoted: msg });
  try {
    const meta = await natsu.groupMetadata(jid);
    const list = meta.participants.map((p, i) => `${i + 1}. +${p.id.split("@")[0]} ${p.admin ? "👑" : "👤"}`).join("\n");
    const chunks = [];
    const lines = list.split("\n");
    for (let i = 0; i < lines.length; i += 30) chunks.push(lines.slice(i, i + 30).join("\n"));
    for (const chunk of chunks) {
      await natsu.sendMessage(jid, { text: `╭═══👥 MEMBRES (${meta.participants.length}) ═══╮\n\n${chunk}\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg });
    }
  } catch { await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: ❌ Erreur listmembers." }, { quoted: msg }); }
}
