import fs from "fs";

export const name = "rules";

const RULES_FILE = "./rules.json";

function loadRules() {
  if (!fs.existsSync(RULES_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(RULES_FILE, "utf-8")); } catch { return {}; }
}

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) {
    return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Commande de groupe uniquement." }, { quoted: msg });
  }
  const rules = loadRules();
  const groupRules = rules[jid];
  if (!groupRules) {
    return await natsu.sendMessage(jid, {
      text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: ⚠️ Aucune règle définie.\n\n_Utilisez .setrules pour définir les règles du groupe._`,
    }, { quoted: msg });
  }
  const lines = groupRules.split("|").map((r, i) => `${i + 1}. ${r.trim()}`).join("\n");
  await natsu.sendMessage(jid, {
    text: `╭═══📜 RÈGLES DU GROUPE ═══╮\n\n${lines}\n\n╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n> 𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣 — Respectez les règles !`,
  }, { quoted: msg });
}
