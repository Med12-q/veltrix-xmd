import { getBareNumber } from "../index.js";

export const name = "sleepwalk";

// Map globale : "groupJid:userNum" -> { listener, endTimeout }
const sleepwalkState = new Map();

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) {
    return natsu.sendMessage(jid, { text: "❌ Cette commande ne fonctionne que dans un groupe." }, { quoted: msg });
  }

  const senderJid = msg.key.participant || msg.key.remoteJid;
  const senderNum = getBareNumber(senderJid);
  const key = `${jid}:${senderNum}`;

  if (sleepwalkState.has(key)) {
    return natsu.sendMessage(jid, { text: "⚠️ Tu es déjà en mode sleepwalk. Attends la fin." }, { quoted: msg });
  }

  const dureeMin = parseInt(args[0]) || 10;
  const dureeMs = dureeMin * 60 * 1000;

  await natsu.sendMessage(jid, {
    text: `🌙 *SLEEPWALK ACTIVÉ*\nTous tes messages seront inversés pendant *${dureeMin} minute(s)*.\nTu ne peux pas désactiver l'effet avant la fin.`,
  }, { quoted: msg });

  const listener = async ({ messages }) => {
    for (const m of messages) {
      if (m.key.remoteJid !== jid) continue;
      if (!m.message || m.key.fromMe) continue;
      const mSenderNum = getBareNumber(m.key.participant || m.key.remoteJid);
      if (mSenderNum !== senderNum) continue;

      const text =
        m.message?.conversation ||
        m.message?.extendedTextMessage?.text || null;
      if (!text) continue;

      const reversed = text.split("").reverse().join("");
      await new Promise(r => setTimeout(r, 2000));
      try {
        await natsu.sendMessage(jid, { text: reversed }, { quoted: m });
      } catch {}
    }
  };

  natsu.ev.on("messages.upsert", listener);

  const endTimeout = setTimeout(async () => {
    natsu.ev.off("messages.upsert", listener);
    sleepwalkState.delete(key);
    try {
      await natsu.sendMessage(jid, {
        text: `🌙 Sleepwalk terminé pour @${senderNum}.`,
        mentions: [senderJid],
      });
    } catch {}
  }, dureeMs);

  sleepwalkState.set(key, { listener, endTimeout });
}
