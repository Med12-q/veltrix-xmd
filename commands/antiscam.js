import { statusProtections } from "../protections.js";

export const name = "antiscam";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Commande de groupe uniquement." }, { quoted: msg });
  if (!args[0] || !["on", "off"].includes(args[0])) {
    return await natsu.sendMessage(jid, {
      text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Anti-Scam est ${statusProtections.antiScam ? "actif ✅" : "inactif ❌"}\n💡 Bloque les messages de type arnaque/escroquerie.\nUsage : .antiscam <on/off>`,
    }, { quoted: msg });
  }
  statusProtections.antiScam = args[0] === "on";
  await natsu.sendMessage(jid, { text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: 🚨 Anti-Scam ${args[0] === "on" ? "activé ✅" : "désactivé ❌"}` }, { quoted: msg });
}
