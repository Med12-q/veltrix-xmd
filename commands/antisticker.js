import { statusProtections } from "../protections.js";

export const name = "antisticker";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) {
    return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Commande de groupe uniquement." }, { quoted: msg });
  }
  if (!args[0] || !["on", "off"].includes(args[0])) {
    return await natsu.sendMessage(jid, {
      text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Anti-Sticker est ${statusProtections.antiSticker ? "actif ✅" : "inactif ❌"}\n\n💡 Bloque les stickers envoyés par les non-admins.\nUsage : .antisticker <on/off>`,
    }, { quoted: msg });
  }
  statusProtections.antiSticker = args[0] === "on";
  await natsu.sendMessage(jid, {
    text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: 🎭 Anti-Sticker ${args[0] === "on" ? "activé ✅ — Les stickers seront supprimés." : "désactivé ❌"}`,
  }, { quoted: msg });
}
