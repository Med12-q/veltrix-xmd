import { CHANNELS } from "../index.js";

export const name = "autojoin";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;

  if (!args[0] || !["status"].includes(args[0])) {
    return await natsu.sendMessage(jid, {
      text:
        `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: 📡 *Canal Officiel*\n\n` +
        `Rejoins le canal officiel pour les mises à jour :\n` +
        `🌐 ${CHANNELS.whatsapp1}\n\n` +
        `Usage : .autojoin status`,
    }, { quoted: msg });
  }

  if (args[0] === "status") {
    return await natsu.sendMessage(jid, {
      text:
        `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: 📡 *Canaux Officiels*\n\n` +
        `• WhatsApp : ${CHANNELS.whatsapp1}\n` +
        `• WhatsApp 2 : ${CHANNELS.whatsapp2}\n` +
        `• Telegram : ${CHANNELS.telegram1}\n` +
        `• Telegram 2 : ${CHANNELS.telegram2}`,
    }, { quoted: msg });
  }
}
