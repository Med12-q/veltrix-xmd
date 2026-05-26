import { downloadMediaMessage } from "@whiskeysockets/baileys";

export const name = "save";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  try {
    const selfJid = natsu.user.id;
    const rawMsg = msg.message?.extendedTextMessage
      ? msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
      : msg.message;
    if (!rawMsg) {
      return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Réponds à un média ou texte pour le sauvegarder." }, { quoted: msg });
    }
    const type = Object.keys(rawMsg)[0];
    if (type === "conversation" || type === "extendedTextMessage") {
      const text = rawMsg.conversation || rawMsg.extendedTextMessage?.text || "Message vide";
      await natsu.sendMessage(selfJid, { text: `💾 Sauvegarde:\n\n${text}` });
      return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Texte sauvegardé ✅" }, { quoted: msg });
    }
    const buffer = await downloadMediaMessage({ message: rawMsg }, "buffer", {}, { logger: console });
    let sendContent = {};
    if (type === "imageMessage") sendContent = { image: buffer, caption: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Image sauvegardée ✅" };
    else if (type === "videoMessage") sendContent = { video: buffer, caption: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Vidéo sauvegardée ✅" };
    else if (type === "audioMessage") sendContent = { audio: buffer, mimetype: "audio/mpeg", fileName: "audio.mp3" };
    else if (type === "stickerMessage") sendContent = { sticker: buffer };
    else return await natsu.sendMessage(jid, { text: "❌ Type non supporté." }, { quoted: msg });
    await natsu.sendMessage(selfJid, sendContent);
    await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: ✅ Média sauvegardé dans tes messages." }, { quoted: msg });
  } catch (e) {
    await natsu.sendMessage(jid, { text: "❌ Erreur save : " + e.message }, { quoted: msg });
  }
}
