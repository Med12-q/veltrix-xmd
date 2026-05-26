import { getBareNumber } from "../index.js";

export const name = "ghostmention";

// Liste factice de membres qui ont quitté le groupe
const GHOST_LIST = [
  "224600000001@s.whatsapp.net",
  "224600000002@s.whatsapp.net",
  "224600000003@s.whatsapp.net",
  "224600000004@s.whatsapp.net",
  "224600000005@s.whatsapp.net",
];

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) {
    return natsu.sendMessage(jid, { text: "❌ Cette commande ne fonctionne que dans un groupe." }, { quoted: msg });
  }

  // Chercher si un vrai numéro est mentionné en argument
  const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  const targetJid = mentions[0];
  const messageText = args.slice(targetJid ? 1 : 0).join(" ").trim();

  if (!messageText) {
    return natsu.sendMessage(jid, {
      text: `❌ Usage : \`.ghostmention @fantome message\`\n\n👻 Membres fantômes disponibles :\n${GHOST_LIST.map(j => `• @${getBareNumber(j)}`).join("\n")}`,
    }, { quoted: msg });
  }

  // Utiliser la cible mentionnée ou un fantôme aléatoire
  const ghostJid = targetJid || GHOST_LIST[Math.floor(Math.random() * GHOST_LIST.length)];
  const ghostNum = getBareNumber(ghostJid);

  await natsu.sendMessage(jid, {
    text: `👻 @${ghostNum} ${messageText}`,
    mentions: [ghostJid],
  });
}
