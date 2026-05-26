import fs from "fs";

export const name = "timecapsule";

const CAPSULE_FILE = "./timecapsules.json";
const activeCapsules = new Map(); // id -> timeoutId

function loadCapsules() {
  try {
    if (fs.existsSync(CAPSULE_FILE)) return JSON.parse(fs.readFileSync(CAPSULE_FILE, "utf-8"));
  } catch {}
  return [];
}

function saveCapsules(list) {
  try { fs.writeFileSync(CAPSULE_FILE, JSON.stringify(list, null, 2)); } catch {}
}

function removeCapsuleById(id) {
  const list = loadCapsules().filter(c => c.id !== id);
  saveCapsules(list);
}

function scheduleOneCapsule(natsu, capsule) {
  const delay = capsule.sendAt - Date.now();
  if (delay <= 0) {
    // Envoyer immédiatement si la date est déjà passée
    sendCapsule(natsu, capsule);
    return;
  }
  const tid = setTimeout(() => sendCapsule(natsu, capsule), delay);
  activeCapsules.set(capsule.id, tid);
}

async function sendCapsule(natsu, capsule) {
  try {
    await natsu.sendMessage(capsule.jid, {
      text: `⏳ *Time Capsule*\n_Programmée le ${new Date(capsule.createdAt).toLocaleString("fr-FR")}_\n\n${capsule.message}`,
    });
  } catch {}
  removeCapsuleById(capsule.id);
  activeCapsules.delete(capsule.id);
}

// Appelé depuis index.js au démarrage/connexion
export function initTimeCapsules(natsu) {
  const list = loadCapsules();
  for (const capsule of list) {
    scheduleOneCapsule(natsu, capsule);
  }
  if (list.length > 0) console.log(`[INFO] ${list.length} time capsule(s) restaurée(s).`);
}

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;

  // Usage : .timecapsule YYYY-MM-DD HH:MM message
  // args[0] = YYYY-MM-DD, args[1] = HH:MM, args[2..] = message
  if (args.length < 3) {
    return natsu.sendMessage(jid, {
      text: "❌ Usage : `.timecapsule YYYY-MM-DD HH:MM message`\nExemple : `.timecapsule 2026-06-01 18:00 Bon anniversaire !`",
    }, { quoted: msg });
  }

  const dateStr = args[0]; // YYYY-MM-DD
  const timeStr = args[1]; // HH:MM
  const message = args.slice(2).join(" ").trim();

  const sendAt = new Date(`${dateStr}T${timeStr}:00`).getTime();
  if (isNaN(sendAt)) {
    return natsu.sendMessage(jid, { text: "❌ Format de date invalide. Utilise : YYYY-MM-DD HH:MM" }, { quoted: msg });
  }
  if (sendAt <= Date.now()) {
    return natsu.sendMessage(jid, { text: "❌ La date doit être dans le futur." }, { quoted: msg });
  }

  const capsule = {
    id: `${jid}_${Date.now()}`,
    jid,
    message,
    sendAt,
    createdAt: Date.now(),
  };

  const list = loadCapsules();
  list.push(capsule);
  saveCapsules(list);
  scheduleOneCapsule(natsu, capsule);

  const dateAffiche = new Date(sendAt).toLocaleString("fr-FR");
  await natsu.sendMessage(jid, {
    text: `⏳ *Time Capsule enregistrée !*\n\n📅 Envoi prévu : *${dateAffiche}*\n💬 Message : _${message}_`,
  }, { quoted: msg });
}
