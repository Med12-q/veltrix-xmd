import fs from "fs";

export const name = "addbadword";
const FILE = "./badwords.json";
function load() { try { return JSON.parse(fs.readFileSync(FILE, "utf-8")); } catch { return {}; } }
function save(d) { fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); }

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Groupe uniquement." }, { quoted: msg });
  if (!args.length) return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Usage : .addbadword <mot>" }, { quoted: msg });
  const word = args.join(" ").toLowerCase();
  const data = load();
  if (!data[jid]) data[jid] = [];
  if (data[jid].includes(word)) return await natsu.sendMessage(jid, { text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: ⚠️ "${word}" est déjà dans la liste.` }, { quoted: msg });
  data[jid].push(word);
  save(data);
  await natsu.sendMessage(jid, { text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: ✅ Mot interdit ajouté : "${word}"` }, { quoted: msg });
}
