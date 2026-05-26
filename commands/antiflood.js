import { statusProtections } from "../protections.js";

export const name = "antiflood";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) {
    return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Commande de groupe uniquement." }, { quoted: msg });
  }
  if (!args[0] || !["on", "off"].includes(args[0])) {
    return await natsu.sendMessage(jid, {
      text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Anti-Flood est ${statusProtections.antiFlood ? "actif ✅" : "inactif ❌"}\n\n💡 Bloque les envois en rafale de médias (images, vidéos, audio).\nUsage : .antiflood <on/off>`,
    }, { quoted: msg });
  }
  statusProtections.antiFlood = args[0] === "on";
  await natsu.sendMessage(jid, {
    text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: 🌊 Anti-Flood ${args[0] === "on" ? "activé ✅" : "désactivé ❌"}`,
  }, { quoted: msg });
}
