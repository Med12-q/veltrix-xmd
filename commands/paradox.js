export const name = "paradox";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;

  if (args.length === 0) {
    return natsu.sendMessage(jid, {
      text: "❌ Usage : `.paradox message`\nExemple : `.paradox Le ciel est bleu`",
    }, { quoted: msg });
  }

  const phrase = args.join(" ").trim();

  // Construire la négation simple
  let negation;
  if (phrase.toLowerCase().includes(" n'est pas ") || phrase.toLowerCase().includes(" ne ")) {
    // Retirer la négation
    negation = phrase
      .replace(/ n'est pas /gi, " est ")
      .replace(/ ne /gi, " ")
      .replace(/ pas /gi, " ");
  } else if (phrase.toLowerCase().includes(" est ")) {
    negation = phrase.replace(/ est /gi, " n'est pas ");
  } else {
    negation = `Ce n'est pas vrai que : "${phrase}"`;
  }

  // Envoyer le premier message
  let firstKey;
  try {
    const sent = await natsu.sendMessage(jid, { text: `🔵 ${phrase}` }, { quoted: msg });
    firstKey = sent?.key;
  } catch { return; }

  // Envoyer le message contradictoire immédiatement
  try {
    await natsu.sendMessage(jid, { text: `🔴 ${negation}` });
  } catch {}

  // Supprimer le premier message après 3 secondes
  if (firstKey) {
    setTimeout(async () => {
      try { await natsu.sendMessage(jid, { delete: firstKey }); } catch {}
    }, 3000);
  }
}
