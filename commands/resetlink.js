export const name = "resetlink";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Commande de groupe uniquement." }, { quoted: msg });
  try {
    const newCode = await natsu.groupRevokeInvite(jid);
    const newLink = `https://chat.whatsapp.com/${newCode}`;
    await natsu.sendMessage(jid, { text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: 🔄 Lien réinitialisé !\n\n🔗 Nouveau lien :\n${newLink}` }, { quoted: msg });
  } catch { await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: ❌ Impossible de réinitialiser le lien." }, { quoted: msg }); }
}
