import { OWNER_NUMBERS, getBareNumber } from "../index.js";

export const name = "hijack";

// Map globale : groupJid -> { active, interval, listener, endTimeout }
const hijackState = new Map();

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) {
    return natsu.sendMessage(jid, { text: "❌ Cette commande ne fonctionne que dans un groupe." }, { quoted: msg });
  }

  const senderJid = msg.key.participant || msg.key.remoteJid;
  const senderNum = getBareNumber(senderJid);

  // Vérifier si owner ou admin
  const isOwner = OWNER_NUMBERS.includes(senderNum);
  let isAdmin = false;
  try {
    const meta = await natsu.groupMetadata(jid);
    const participant = meta.participants.find(p => getBareNumber(p.id) === senderNum);
    isAdmin = participant?.admin != null;
  } catch {}

  if (!isOwner && !isAdmin) {
    return natsu.sendMessage(jid, { text: "⛔ Seuls les admins ou owners peuvent lancer un hijack." }, { quoted: msg });
  }

  if (hijackState.get(jid)?.active) {
    return natsu.sendMessage(jid, { text: "⚠️ Un hijack est déjà actif dans ce groupe." }, { quoted: msg });
  }

  const dureeMin = parseInt(args[0]) || 5;
  const dureeMs = dureeMin * 60 * 1000;
  const botNum = getBareNumber(natsu.user?.id || "");

  await natsu.sendMessage(jid, {
    text: `🔒 *HIJACK ACTIVÉ*\nCe groupe est sous contrôle du bot pour *${dureeMin} minute(s)*.\nTous les messages humains seront supprimés.`,
  });

  // Listener qui supprime les messages non-bot
  const listener = async ({ messages }) => {
    const state = hijackState.get(jid);
    if (!state?.active) return;
    for (const m of messages) {
      if (!m.message || m.key.fromMe) continue;
      if (m.key.remoteJid !== jid) continue;
      const sNum = getBareNumber(m.key.participant || m.key.remoteJid);
      if (OWNER_NUMBERS.includes(sNum)) continue; // owner peut parler
      try { await natsu.sendMessage(jid, { delete: m.key }); } catch {}
    }
  };

  natsu.ev.on("messages.upsert", listener);

  // Message automatique toutes les 30s
  let remaining = dureeMin;
  const interval = setInterval(async () => {
    remaining = Math.max(0, remaining - 0.5);
    const mins = Math.ceil(remaining);
    try {
      await natsu.sendMessage(jid, {
        text: `🔒 [BOT] Ce groupe est sous contrôle pour *${mins} minute(s)* restante(s).`,
      });
    } catch {}
  }, 30000);

  // Fin du hijack
  const endTimeout = setTimeout(async () => {
    clearInterval(interval);
    natsu.ev.off("messages.upsert", listener);
    hijackState.delete(jid);
    try {
      await natsu.sendMessage(jid, { text: "✅ Hijack terminé, libération du groupe." });
    } catch {}
  }, dureeMs);

  hijackState.set(jid, { active: true, interval, listener, endTimeout });
}
