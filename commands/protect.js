import { statusProtections } from "../protections.js";

export const name = "protect";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  const lines = Object.entries(statusProtections)
    .map(([k, v]) => `${v ? "✅" : "❌"} ${k}`)
    .join("\n");
  await natsu.sendMessage(jid, {
    text: `╭═══🛡️ ÉTAT PROTECTIONS 𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣 🛡️═══╮\n\n${lines}\n\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`,
  }, { quoted: msg });
}
