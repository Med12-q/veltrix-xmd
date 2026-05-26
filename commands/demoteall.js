export const name = "demoteall";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) {
    return await natsu.sendMessage(jid, { text: "> 𝗗𝗘𝗡𝗧𝗦𝗨 𝗫𝗗: Commande de groupe uniquement." }, { quoted: msg });
  }
  try {
    const meta = await natsu.groupMetadata(jid);
    const botId = natsu.user?.id;
    const admins = meta.participants.filter((p) => p.admin && p.id !== botId);
    if (!admins.length) return await natsu.sendMessage(jid, { text: "> 𝗗𝗘𝗡𝗧𝗦𝗨 𝗫𝗗: Aucun admin à rétrograder." }, { quoted: msg });
    for (const a of admins) {
      await natsu.groupParticipantsUpdate(jid, [a.id], "demote").catch(() => {});
    }
    await natsu.sendMessage(jid, { text: `> 𝗗𝗘𝗡𝗧𝗦𝗨 𝗫𝗗: ✅ ${admins.length} admin(s) rétrogradé(s).` }, { quoted: msg });
  } catch (e) {
    await natsu.sendMessage(jid, { text: "> 𝗗𝗘𝗡𝗧𝗦𝗨 𝗫𝗗: ❌ Erreur demoteall." }, { quoted: msg });
  }
}
