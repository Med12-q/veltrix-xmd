export const name = "glitch";

const GLITCH_CHARS = "▓░█▄▀▌▐╗╔╝╚│─╬╠╣╦╩@#$%&*!?~^<>{}[]|\\";

function glitchText(text) {
  const chars = text.split("");
  const nbMutations = Math.max(1, Math.floor(Math.random() * 3) + 1);
  for (let i = 0; i < nbMutations; i++) {
    const pos = Math.floor(Math.random() * chars.length);
    if (chars[pos] !== " ") {
      chars[pos] = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
    }
  }
  return chars.join("");
}

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;

  if (args.length === 0) {
    return natsu.sendMessage(jid, {
      text: "❌ Usage : `.glitch message`\nExemple : `.glitch Bonjour le monde`",
    }, { quoted: msg });
  }

  const original = args.join(" ").trim();

  await natsu.sendMessage(jid, {
    text: `⚡ *GLITCH INITIÉ*\nMessage original : _${original}_`,
  }, { quoted: msg });

  // Envoyer 10 versions glitchées avec 300ms d'intervalle
  for (let i = 1; i <= 10; i++) {
    await new Promise(r => setTimeout(r, 350));
    const glitched = glitchText(original);
    const progress = "█".repeat(i) + "░".repeat(10 - i);
    try {
      await natsu.sendMessage(jid, {
        text: `[${progress}] ${glitched}`,
      });
    } catch {}
  }

  // Message final stable
  await new Promise(r => setTimeout(r, 400));
  try {
    await natsu.sendMessage(jid, { text: `✅ *GLITCH TERMINÉ* — ${original}` });
  } catch {}
}
