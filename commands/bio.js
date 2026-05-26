export const name = "bio";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  try {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    const participant = msg.message?.extendedTextMessage?.contextInfo?.participant;
    const target = mentioned || participant || (jid.endsWith("@g.us") ? msg.key.participant : jid);
    if (!target) {
      return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Mentionne un utilisateur ou réponds à son message." }, { quoted: msg });
    }
    let status = "_Aucun statut_";
    let pp = null;
    try {
      const statusResult = await natsu.fetchStatus(target);
      if (statusResult?.status) status = statusResult.status;
    } catch {}
    try { pp = await natsu.profilePictureUrl(target, "image"); } catch {}

    const text =
      `╭═══👤 PROFIL ═══╮\n` +
      `│ 📱 +${target.split("@")[0]}\n` +
      `│ 📝 Bio : ${status}\n` +
      `╰━━━━━━━━━━━━━━━━╯`;

    if (pp) {
      await natsu.sendMessage(jid, { image: { url: pp }, caption: text }, { quoted: msg });
    } else {
      await natsu.sendMessage(jid, { text }, { quoted: msg });
    }
  } catch (e) {
    await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: ❌ Erreur bio." }, { quoted: msg });
  }
}
