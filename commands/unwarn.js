import fs from "fs";

export const name = "unwarn";

const WARN_FILE = "./warns.json";

function loadWarns() {
  if (!fs.existsSync(WARN_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(WARN_FILE, "utf-8")); } catch { return {}; }
}
function saveWarns(data) { fs.writeFileSync(WARN_FILE, JSON.stringify(data, null, 2)); }

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) {
    return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Commande de groupe uniquement." }, { quoted: msg });
  }
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  const participant = msg.message?.extendedTextMessage?.contextInfo?.participant;
  const target = mentioned || participant;
  if (!target) {
    return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: ⚠️ Mentionne un membre : .unwarn @membre" }, { quoted: msg });
  }
  const warns = loadWarns();
  const key = `${jid}:${target}`;
  warns[key] = 0;
  saveWarns(warns);
  await natsu.sendMessage(jid, {
    text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: ✅ Avertissements de @${target.split("@")[0]} réinitialisés.`,
    mentions: [target],
  }, { quoted: msg });
}
