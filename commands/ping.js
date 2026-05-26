export const name = "ping";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  try {
    const start = Date.now();
    const sent = await natsu.sendMessage(jid, { text: "⏳ *𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣* — Calcul en cours..." }, { quoted: msg });
    const latency = Date.now() - start;

    let speed = "";
    if (latency < 100) speed = "🚀 Ultrarapide";
    else if (latency < 300) speed = "⚡ Rapide";
    else if (latency < 700) speed = "🏎️ Normal";
    else speed = "🐢 Lent";

    const bars = Math.min(10, Math.max(1, Math.floor(10 - latency / 100)));
    const bar = "█".repeat(bars) + "░".repeat(10 - bars);

    const text =
      `╭━━━━━━━━━━━━━━━━━━━━╮\n` +
      `┃  🏓  *PONG !*\n` +
      `┃  𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣 — En ligne\n` +
      `╰━━━━━━━━━━━━━━━━━━━━╯\n\n` +
      `⏱️  *Latence :* ${latency} ms\n` +
      `📶  *Signal :* [${bar}]\n` +
      `🔰  *Vitesse :* ${speed}\n` +
      `⏰  *Uptime :* ${formatUptime(process.uptime())}\n\n` +
      `> ©2026 𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣`;

    try { await natsu.sendMessage(jid, { delete: sent.key }); } catch {}
    await natsu.sendMessage(jid, { text }, { quoted: msg });
  } catch (e) {
    await natsu.sendMessage(jid, { text: "> ⚠️ 𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Impossible de calculer la vitesse." }, { quoted: msg });
  }
}

function formatUptime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return `${h}h ${m}m ${s}s`;
}
