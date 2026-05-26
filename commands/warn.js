import fs from "fs";

export const name = "warn";

const WARN_FILE = "./warns.json";
const MAX_WARNS = 3;

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
    return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: ⚠️ Mentionne un membre : .warn @membre" }, { quoted: msg });
  }
  const reason = args.join(" ") || "Aucune raison spécifiée";
  const warns = loadWarns();
  const key = `${jid}:${target}`;
  warns[key] = (warns[key] || 0) + 1;
  saveWarns(warns);
  const count = warns[key];

  await natsu.sendMessage(jid, {
    text:
      `╭═══⚠️ AVERTISSEMENT ⚠️═══╮\n` +
      `│ 👤 @${target.split("@")[0]}\n` +
      `│ 📋 Raison : ${reason}\n` +
      `│ 🔢 Avertissement : ${count}/${MAX_WARNS}\n` +
      `╰━━━━━━━━━━━━━━━━━━━━━╯\n` +
      (count >= MAX_WARNS ? `\n🚫 Limite atteinte — expulsion !` : `\n_${MAX_WARNS - count} avertissement(s) restant(s)_`),
    mentions: [target],
  }, { quoted: msg });

  if (count >= MAX_WARNS) {
    warns[key] = 0;
    saveWarns(warns);
    try {
      await natsu.groupParticipantsUpdate(jid, [target], "remove");
    } catch {}
  }
}
