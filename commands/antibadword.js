import { statusProtections } from "../protections.js";

export const name = "antibadword";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Groupe uniquement." }, { quoted: msg });
  if (!args[0] || !["on","off"].includes(args[0])) {
    return await natsu.sendMessage(jid, {
      text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Anti-BadWord est ${statusProtections.antiBadWord ? "actif ✅" : "inactif ❌"}\n💡 Supprime les messages contenant des mots de la liste noire.\nUsage : .antibadword <on/off>\nGérer : .addbadword / .delbadword / .listbadword`,
    }, { quoted: msg });
  }
  statusProtections.antiBadWord = args[0] === "on";
  await natsu.sendMessage(jid, { text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: 🚫 Anti-BadWord ${args[0] === "on" ? "activé ✅" : "désactivé ❌"}` }, { quoted: msg });
}
