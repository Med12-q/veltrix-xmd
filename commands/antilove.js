import { statusProtections } from "../protections.js";

export const name = "antilove";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) {
    return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Commande de groupe uniquement." }, { quoted: msg });
  }
  if (!args[0] || !["on", "off"].includes(args[0])) {
    return await natsu.sendMessage(jid, {
      text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Anti-Love est ${statusProtections.antiLove ? "actif ✅" : "inactif ❌"}\n\n💡 Bloque les messages romantiques/amoureux dans le groupe.\nUsage : .antilove <on/off>`,
    }, { quoted: msg });
  }
  statusProtections.antiLove = args[0] === "on";
  await natsu.sendMessage(jid, {
    text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: 💔 Anti-Love ${args[0] === "on" ? "activé ✅ — Les messages romantiques seront supprimés." : "désactivé ❌"}`,
  }, { quoted: msg });
}
