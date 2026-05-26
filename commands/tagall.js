export const name = "tagall";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) {
    return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣 : Commande de groupe uniquement." }, { quoted: msg });
  }
  try {
    const meta = await natsu.groupMetadata(jid);
    const mentions = meta.participants.map(p => p.id);
    
    // Construction du message formaté
    let message = "╭━━━〔 𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣 〕━━━╮\n";
    message += "┃✪ 📢 *Attention*\n";
    message += "╰━━━━━━━━━━━━━━━━━━╯\n";
    
    // Ajouter chaque mention sur une nouvelle ligne avec le symbole ❍ et un @
    mentions.forEach(m => {
      message += `❍ @${m.split("@")[0]}\n`;
    });
    
    // Ajouter un message personnalisé si fourni (args)
    const extra = args.join(" ");
    if (extra) {
      message = `📢 ${extra}\n\n` + message;
    }
    
    await natsu.sendMessage(jid, {
      text: message,
      mentions: mentions
    }, { quoted: msg });
    
  } catch (e) {
    console.error(e);
    await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣 : ❌ Erreur lors du tagall." }, { quoted: msg });
  }
}