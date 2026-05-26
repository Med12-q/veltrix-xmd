import { statusProtections } from "../protections.js";

export const name = "welcome";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Commande de groupe uniquement." }, { quoted: msg });
  if (!args[0] || !["on", "off"].includes(args[0])) {
    return await natsu.sendMessage(jid, {
      text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Bienvenue auto est ${statusProtections.welcome ? "actif ✅" : "inactif ❌"}\nUsage : .welcome <on/off>`,
    }, { quoted: msg });
  }
  statusProtections.welcome = args[0] === "on";
  await natsu.sendMessage(jid, { text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: 👋 Message de bienvenue ${args[0] === "on" ? "activé ✅" : "désactivé ❌"}` }, { quoted: msg });
}
