import { statusProtections } from "../protections.js";

export const name = "antitag";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) {
    return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Commande de groupe uniquement." }, { quoted: msg });
  }
  if (!args[0] || !["on", "off"].includes(args[0])) {
    return await natsu.sendMessage(jid, {
      text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Anti-Tag est ${statusProtections.antiTag ? "actif ✅" : "inactif ❌"}\n\n💡 Bloque les mentions en masse (tagall par des non-admins).\nUsage : .antitag <on/off>`,
    }, { quoted: msg });
  }
  statusProtections.antiTag = args[0] === "on";
  await natsu.sendMessage(jid, {
    text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: 🏷️ Anti-Tag ${args[0] === "on" ? "activé ✅ — Les mentions en masse de non-admins seront supprimées." : "désactivé ❌"}`,
  }, { quoted: msg });
}
