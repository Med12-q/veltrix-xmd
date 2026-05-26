import fs from "fs";

export const name = "setrules";

const RULES_FILE = "./rules.json";

function loadRules() {
  if (!fs.existsSync(RULES_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(RULES_FILE, "utf-8")); } catch { return {}; }
}
function saveRules(data) { fs.writeFileSync(RULES_FILE, JSON.stringify(data, null, 2)); }

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) {
    return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Commande de groupe uniquement." }, { quoted: msg });
  }
  if (!args.length) {
    return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Usage : .setrules Règle 1 | Règle 2 | Règle 3" }, { quoted: msg });
  }
  const rulesText = args.join(" ");
  const rules = loadRules();
  rules[jid] = rulesText;
  saveRules(rules);
  await natsu.sendMessage(jid, {
    text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: ✅ Règles du groupe mises à jour !\n\n_Tape .rules pour les afficher._`,
  }, { quoted: msg });
}
