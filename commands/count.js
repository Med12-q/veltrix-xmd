export const name = "count";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Commande de groupe uniquement." }, { quoted: msg });
  try {
    const meta = await natsu.groupMetadata(jid);
    const total = meta.participants.length;
    const admins = meta.participants.filter(p => p.admin).length;
    const members = total - admins;
    await natsu.sendMessage(jid, {
      text:
        `╭═══📊 STATISTIQUES ═══╮\n` +
        `│ 👥 Membres total : ${total}\n` +
        `│ 👑 Admins : ${admins}\n` +
        `│ 👤 Membres : ${members}\n` +
        `│ 📌 Groupe : ${meta.subject}\n` +
        `╰━━━━━━━━━━━━━━━━━━━╯`,
    }, { quoted: msg });
  } catch { await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: ❌ Erreur count." }, { quoted: msg }); }
}
