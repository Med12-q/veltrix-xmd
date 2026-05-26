import fs from "fs";

export const name = "listwarn";

const WARN_FILE = "./warns.json";

function loadWarns() {
  if (!fs.existsSync(WARN_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(WARN_FILE, "utf-8")); } catch { return {}; }
}

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) {
    return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Commande de groupe uniquement." }, { quoted: msg });
  }
  const warns = loadWarns();
  const groupWarns = Object.entries(warns)
    .filter(([k, v]) => k.startsWith(jid) && v > 0)
    .map(([k, v]) => `• @${k.split(":")[1]?.split("@")[0]} — ${v} avertissement(s)`);

  if (!groupWarns.length) {
    return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: ✅ Aucun avertissement dans ce groupe." }, { quoted: msg });
  }
  await natsu.sendMessage(jid, {
    text: `╭═══📋 LISTE AVERTISSEMENTS ═══╮\n${groupWarns.join("\n")}\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯`,
  }, { quoted: msg });
}
