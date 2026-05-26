import { statusProtections } from "../protections.js";

export const name = "antiinsult";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) {
    return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Commande de groupe uniquement." }, { quoted: msg });
  }
  if (!args[0] || !["on", "off"].includes(args[0])) {
    return await natsu.sendMessage(jid, {
      text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Anti-Insulte est ${statusProtections.antiInsult ? "actif ✅" : "inactif ❌"}\n\n💡 Bloque les messages contenant des insultes ou mots grossiers.\nUsage : .antiinsult <on/off>`,
    }, { quoted: msg });
  }
  statusProtections.antiInsult = args[0] === "on";
  await natsu.sendMessage(jid, {
    text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: 🤬 Anti-Insulte ${args[0] === "on" ? "activé ✅ — Les messages offensants seront supprimés." : "désactivé ❌"}`,
  }, { quoted: msg });
}
