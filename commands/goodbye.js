import { statusProtections } from "../protections.js";

export const name = "goodbye";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Commande de groupe uniquement." }, { quoted: msg });
  if (!args[0] || !["on", "off"].includes(args[0])) {
    return await natsu.sendMessage(jid, {
      text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Au-revoir auto est ${statusProtections.goodbye ? "actif ✅" : "inactif ❌"}\nUsage : .goodbye <on/off>`,
    }, { quoted: msg });
  }
  statusProtections.goodbye = args[0] === "on";
  await natsu.sendMessage(jid, { text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: 👋 Message d'au-revoir ${args[0] === "on" ? "activé ✅" : "désactivé ❌"}` }, { quoted: msg });
}
