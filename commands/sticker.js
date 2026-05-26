import fs from "fs";
import path from "path";
import { exec } from "child_process";
import crypto from "crypto";
import { downloadMediaMessage } from "@whiskeysockets/baileys";

export const name = "sticker";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  try {
    const username = msg.pushName || "Utilisateur";
    let targetMessage = msg;
    if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      const quoted = msg.message.extendedTextMessage.contextInfo;
      targetMessage = {
        key: { remoteJid: jid, id: quoted.stanzaId, participant: quoted.participant },
        message: quoted.quotedMessage,
      };
    }
    const mediaMsg = targetMessage.message?.imageMessage || targetMessage.message?.videoMessage;
    if (!mediaMsg) {
      return await natsu.sendMessage(jid, { text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: ⚠️ Réponds à une image ou vidéo avec .sticker` }, { quoted: msg });
    }
    const mediaBuffer = await downloadMediaMessage(targetMessage, "buffer", {}, { reuploadRequest: natsu.updateMediaMessage });
    if (!mediaBuffer) return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: ⚠️ Impossible de télécharger le média." }, { quoted: msg });

    const tempDir = "./temp";
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    const inputPath = path.join(tempDir, `input_${Date.now()}.mp4`);
    const outputPath = path.join(tempDir, `sticker_${Date.now()}.webp`);
    fs.writeFileSync(inputPath, mediaBuffer);

    const isAnimated = mediaMsg.mimetype?.includes("video") || mediaMsg.mimetype?.includes("gif") || mediaMsg.seconds > 0;
    const cmd = isAnimated
      ? `ffmpeg -y -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -loop 0 -c:v libwebp -preset default -an -vsync 0 -pix_fmt yuva420p -quality 70 -compression_level 6 "${outputPath}"`
      : `ffmpeg -y -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -loop 0 -c:v libwebp -preset default -an -vsync 0 -pix_fmt yuva420p -quality 80 -compression_level 6 "${outputPath}"`;

    await new Promise((resolve, reject) => exec(cmd, (err) => (err ? reject(err) : resolve())));
    if (!fs.existsSync(outputPath)) throw new Error("Échec conversion WebP.");

    const webpBuffer = fs.readFileSync(outputPath);
    await natsu.sendMessage(jid, { sticker: webpBuffer }, { quoted: msg });

    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);
  } catch (e) {
    console.error("❌ Erreur sticker.js :", e);
    await natsu.sendMessage(jid, { text: `❌ *Erreur sticker :* ${e.message}` }, { quoted: msg });
  }
}
