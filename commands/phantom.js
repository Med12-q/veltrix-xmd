import { getBareNumber } from "../index.js";

export const name = "phantom";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) {
    return natsu.sendMessage(jid, { text: "❌ Cette commande ne fonctionne que dans un groupe." }, { quoted: msg });
  }

  // Récupérer la cible mentionnée
  const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  const targetJid = mentions[0];
  if (!targetJid) {
    return natsu.sendMessage(jid, { text: "❌ Mentionne un utilisateur : `.phantom @utilisateur message`" }, { quoted: msg });
  }

  // Le message = tout après la mention
  const messageText = args.slice(1).join(" ").trim();
  if (!messageText) {
    return natsu.sendMessage(jid, { text: "❌ Précise un message à envoyer." }, { quoted: msg });
  }

  // Récupérer un membre aléatoire du groupe (différent de la cible et du bot)
  let fakeFrom = null;
  try {
    const meta = await natsu.groupMetadata(jid);
    const botNum = getBareNumber(natsu.user?.id || "");
    const targetNum = getBareNumber(targetJid);
    const others = meta.participants.filter(p => {
      const n = getBareNumber(p.id);
      return n !== botNum && n !== targetNum;
    });
    if (others.length > 0) {
      fakeFrom = others[Math.floor(Math.random() * others.length)].id;
    }
  } catch {}

  const fakeName = fakeFrom ? `@${getBareNumber(fakeFrom)}` : "quelqu'un du groupe";

  // Envoyer le MP à la cible
  try {
    await natsu.sendMessage(targetJid, {
      text: `📩 *De la part de ${fakeName} :*\n\n${messageText}`,
    });
    // Aucune confirmation dans le groupe — pas de trace
  } catch (e) {
    await natsu.sendMessage(jid, { text: "❌ Impossible d'envoyer le message privé à cette personne." }, { quoted: msg });
  }
}
