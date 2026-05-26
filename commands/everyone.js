export const name = "everyone";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) {
    return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Commande de groupe uniquement." }, { quoted: msg });
  }
  try {
    const meta = await natsu.groupMetadata(jid);
    const mentions = meta.participants.map((p) => p.id);
    const customText = args.join(" ");
    const header = customText
      ? `📣 *${customText}*\n\n`
      : `📢 *Attention tout le monde !*\n\n`;
    await natsu.sendMessage(jid, {
      text: header + mentions.map((m) => `@${m.split("@")[0]}`).join(" "),
      mentions,
    }, { quoted: msg });
  } catch (e) {
    await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: ❌ Erreur everyone." }, { quoted: msg });
  }
}
