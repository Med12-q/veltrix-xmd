import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export const name = "photo";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  try {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage;
    if (!quoted) {
      return await natsu.sendMessage(jid, { text: "> 𝗗𝗘𝗡𝗧𝗦𝗨 𝗫𝗗: Réponds au sticker à convertir en image." }, { quoted: msg });
    }
    const stream = await downloadContentFromMessage(quoted, "sticker");
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    await natsu.sendMessage(jid, { image: buffer, caption: "> 𝗗𝗘𝗡𝗧𝗦𝗨 𝗫𝗗: Conversion réussie ✅" }, { quoted: msg });
  } catch (e) {
    await natsu.sendMessage(jid, { text: "❌ Erreur conversion sticker → photo : " + e.message }, { quoted: msg });
  }
}
