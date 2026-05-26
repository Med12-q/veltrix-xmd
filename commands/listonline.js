export const name = "listonline";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) {
    return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Commande de groupe uniquement." }, { quoted: msg });
  }
  try {
    const meta = await natsu.groupMetadata(jid);
    const chats = natsu.chats || {};
    const online = Object.entries(chats)
      .filter(([id, chat]) =>
        id.endsWith("@s.whatsapp.net") &&
        chat?.presences &&
        meta.participants.some((p) => id.startsWith(p.id))
      )
      .map(([id], i) => `*${i + 1}.* @${id.split("@")[0]}`)
      .join("\n");
    await natsu.sendMessage(jid, {
      text: `> ╭════۩۞۩════╮\n> 👤 𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣 - LIST ONLINE\n> ╰════۩۞۩════╯\n<==================>\n${online || "Aucun membre en ligne."}`,
    }, { quoted: msg });
  } catch (e) {
    await natsu.sendMessage(jid, { text: `> ⚠️ 𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Impossible de récupérer la liste.\nRaison: ${e.message}` }, { quoted: msg });
  }
}
