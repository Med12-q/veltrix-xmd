import { statusProtections } from "../protections.js";

export const name = "antiraid";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) {
    return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Commande de groupe uniquement." }, { quoted: msg });
  }
  if (!args[0] || !["on", "off"].includes(args[0])) {
    return await natsu.sendMessage(jid, {
      text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Anti-Raid est ${statusProtections.antiRaid ? "actif ✅" : "inactif ❌"}\n\n💡 Détecte et expulse les membres qui rejoignent en masse (raid).\nUsage : .antiraid <on/off>`,
    }, { quoted: msg });
  }
  statusProtections.antiRaid = args[0] === "on";
  await natsu.sendMessage(jid, {
    text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: 🛡️ Anti-Raid ${args[0] === "on" ? "activé ✅ — Toute tentative de raid sera bloquée." : "désactivé ❌"}`,
  }, { quoted: msg });
}
