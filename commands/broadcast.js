export const name = "broadcast";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!args.length) return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Usage : .broadcast <message>" }, { quoted: msg });
  const text = args.join(" ");
  try {
    const groups = Object.keys(await natsu.groupFetchAllParticipating());
    let sent = 0;
    for (const g of groups) {
      try { await natsu.sendMessage(g, { text: `📢 *BROADCAST 𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣*\n\n${text}` }); sent++; } catch {}
      await new Promise(r => setTimeout(r, 500));
    }
    await natsu.sendMessage(jid, { text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: ✅ Broadcast envoyé à ${sent}/${groups.length} groupe(s).` }, { quoted: msg });
  } catch { await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: ❌ Erreur broadcast." }, { quoted: msg }); }
}
