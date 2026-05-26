import { loadSudo, removeSudo, normalizeNumber } from "../index.js";

export const name = "delsudo";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  const raw = mentioned ? mentioned.split("@")[0] : args[0];
  const bare = normalizeNumber(raw);
  if (!bare) {
    return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Usage : .delsudo @mention ou .delsudo 224xxxxxxxx" }, { quoted: msg });
  }
  const before = loadSudo();
  if (!before.includes(bare)) {
    return await natsu.sendMessage(jid, { text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: ⚠️ Le numéro *${bare}* n'est pas dans la liste sudo.` }, { quoted: msg });
  }
  const updated = removeSudo(bare);
  await natsu.sendMessage(jid, {
    text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: 🗑️ *${bare}* retiré des sudo.\nSudo restants : ${updated.length ? updated.join(", ") : "Aucun"}`,
  }, { quoted: msg });
}
