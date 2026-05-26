import fs from "fs";

export const name = "listbadword";
const FILE = "./badwords.json";
function load() { try { return JSON.parse(fs.readFileSync(FILE, "utf-8")); } catch { return {}; } }

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Groupe uniquement." }, { quoted: msg });
  const data = load();
  const words = data[jid];
  if (!words?.length) return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: ✅ Aucun mot interdit dans ce groupe." }, { quoted: msg });
  await natsu.sendMessage(jid, {
    text: `╭═══🚫 MOTS INTERDITS ═══╮\n${words.map((w, i) => `${i + 1}. ${w}`).join("\n")}\n╰━━━━━━━━━━━━━━━━━━━╯\n\nTotal : ${words.length} mot(s)`,
  }, { quoted: msg });
}
