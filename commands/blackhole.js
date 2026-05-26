import fs from "fs";
import { getBareNumber, OWNER_NUMBERS } from "../index.js";

export const name = "blackhole";

const BH_FILE = "./blackhole.json";

function loadBlackhole() {
  try {
    if (fs.existsSync(BH_FILE)) return new Set(JSON.parse(fs.readFileSync(BH_FILE, "utf-8")));
  } catch {}
  return new Set();
}

function saveBlackhole(set) {
  try { fs.writeFileSync(BH_FILE, JSON.stringify([...set], null, 2)); } catch {}
}

// Initialiser le Set global au démarrage
global.blackholedUsers = loadBlackhole();

export function isBlackholed(num) {
  return (global.blackholedUsers || new Set()).has(num);
}

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  const senderNum = getBareNumber(msg.key.participant || msg.key.remoteJid);

  if (!OWNER_NUMBERS.includes(senderNum)) {
    return natsu.sendMessage(jid, { text: "⛔ Seuls les owners peuvent gérer le blackhole." }, { quoted: msg });
  }

  const subCmd = (args[0] || "").toLowerCase();

  // Sous-commande : unblackhole
  if (subCmd === "remove" || subCmd === "del" || subCmd === "off") {
    const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const target = mentions[0];
    if (!target) {
      return natsu.sendMessage(jid, { text: "❌ Mentionne l'utilisateur à retirer du blackhole." }, { quoted: msg });
    }
    const targetNum = getBareNumber(target);
    global.blackholedUsers.delete(targetNum);
    saveBlackhole(global.blackholedUsers);
    return natsu.sendMessage(jid, {
      text: `✅ @${targetNum} retiré du Black Hole. Il peut à nouveau utiliser les commandes.`,
      mentions: [target],
    }, { quoted: msg });
  }

  // Sous-commande : liste
  if (subCmd === "list") {
    const list = [...(global.blackholedUsers || [])];
    if (list.length === 0) return natsu.sendMessage(jid, { text: "🕳️ Aucun utilisateur dans le Black Hole." }, { quoted: msg });
    return natsu.sendMessage(jid, {
      text: `🕳️ *Black Hole — Utilisateurs bloqués :*\n\n${list.map(n => `• @${n}`).join("\n")}`,
    }, { quoted: msg });
  }

  // Blacklister un utilisateur mentionné
  const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  const target = mentions[0];
  if (!target) {
    return natsu.sendMessage(jid, {
      text: "❌ Usage :\n`.blackhole @utilisateur` — Blacklister\n`.blackhole remove @utilisateur` — Retirer\n`.blackhole list` — Voir la liste",
    }, { quoted: msg });
  }

  const targetNum = getBareNumber(target);
  if (OWNER_NUMBERS.includes(targetNum)) {
    return natsu.sendMessage(jid, { text: "⛔ Impossible de blackholer un owner." }, { quoted: msg });
  }

  global.blackholedUsers.add(targetNum);
  saveBlackhole(global.blackholedUsers);

  await natsu.sendMessage(jid, {
    text: `🕳️ @${targetNum} aspiré dans le *Black Hole* !\nToutes ses commandes retourneront "Commande inconnue".`,
    mentions: [target],
  }, { quoted: msg });
}
