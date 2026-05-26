import { OWNER_NUMBERS, getBareNumber } from "../index.js";

export const name = "mirrordimension";

// Map globale : sourceJid -> { targetJid, listener, endTimeout }
const mirrorState = new Map();

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  const senderNum = getBareNumber(msg.key.participant || msg.key.remoteJid);

  if (!OWNER_NUMBERS.includes(senderNum)) {
    return natsu.sendMessage(jid, { text: "⛔ Seuls les owners peuvent utiliser cette commande." }, { quoted: msg });
  }

  // .mirrordimension SOURCE_JID CIBLE_JID [durée_minutes]
  if (args.length < 2) {
    return natsu.sendMessage(jid, {
      text: "❌ Usage : `.mirrordimension JID_SOURCE JID_CIBLE [durée_en_minutes]`",
    }, { quoted: msg });
  }

  const sourceJid = args[0];
  const targetJid = args[1];
  const dureeMin = parseInt(args[2]) || 30;
  const dureeMs = dureeMin * 60 * 1000;

  if (mirrorState.has(sourceJid)) {
    return natsu.sendMessage(jid, { text: "⚠️ Un miroir est déjà actif pour ce groupe source." }, { quoted: msg });
  }

  await natsu.sendMessage(jid, {
    text: `🪞 *MIRROR DIMENSION ACTIVÉ*\n\n📤 Source : ${sourceJid}\n📥 Cible : ${targetJid}\n⏱️ Durée : ${dureeMin} min`,
  }, { quoted: msg });

  const listener = async ({ messages }) => {
    for (const m of messages) {
      if (m.key.remoteJid !== sourceJid) continue;
      if (!m.message || m.key.fromMe) continue;

      const text =
        m.message?.conversation ||
        m.message?.extendedTextMessage?.text ||
        m.message?.imageMessage?.caption ||
        m.message?.videoMessage?.caption || null;

      if (!text) continue;

      const senderDisplay = getBareNumber(m.key.participant || m.key.remoteJid);
      try {
        await natsu.sendMessage(targetJid, {
          text: `[MIRROR] @${senderDisplay} : ${text}`,
        });
      } catch {}
    }
  };

  natsu.ev.on("messages.upsert", listener);

  const endTimeout = setTimeout(async () => {
    natsu.ev.off("messages.upsert", listener);
    mirrorState.delete(sourceJid);
    try {
      await natsu.sendMessage(jid, { text: `🪞 Mirror Dimension terminé après ${dureeMin} minutes.` });
    } catch {}
  }, dureeMs);

  mirrorState.set(sourceJid, { targetJid, listener, endTimeout });
}
