export const name = "admins";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Commande de groupe uniquement." }, { quoted: msg });
  try {
    const meta = await natsu.groupMetadata(jid);
    const admins = meta.participants.filter(p => p.admin);
    if (!admins.length) return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Aucun admin trouvé." }, { quoted: msg });
    const list = admins.map((a, i) => `${i + 1}. @${a.id.split("@")[0]} ${a.admin === "superadmin" ? "👑" : "⚡"}`).join("\n");
    const mentions = admins.map(a => a.id);
    await natsu.sendMessage(jid, {
      text: `╭═══👑 ADMINS — ${meta.subject} ═══╮\n\n${list}\n\n📊 Total : ${admins.length} admin(s)\n╰━━━━━━━━━━━━━━━━━━━━━╯`,
      mentions,
    }, { quoted: msg });
  } catch { await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: ❌ Erreur admins." }, { quoted: msg }); }
}
