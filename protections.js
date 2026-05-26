import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

export const statusProtections = {
  antiLink: false,
  antiPromote: false,
  antiDemote: false,
  antiBot: false,
  antiSpam: false,
  antiLove: false,
  antiTag: false,
  antiSticker: false,
  antiInsult: false,
  antiFake: false,
  antiFlood: false,
  antiRaid: false,
  antiScam: false,
  antiChange: false,
  antiVirtual: false,
  antiBadWord: false,
  welcome: false,
  goodbye: false,
  autoLikeStatus: true,
  warnAdmin: false,
};

const SPAM_LIMIT = 4;
const TIME_LIMIT_MS = 5000;
const messageHistory = {};
const floodHistory = {};
const raidHistory = {};

const LOVE_WORDS = ["je t'aime","jtm","iloveyou","i love you","mon amour","ma chérie","mon chéri","💕","❤️","🥰","😍","💞","💓","💗","😘","kiss","bisou","chéri","chérie","bébé","bb"];
const INSULT_WORDS = ["pute","connard","salaud","idiot","imbécile","abruti","merde","fuck","bâtard","bastard","nique","fdp","tg","fils de","va te faire","encule","enculé"];
const SCAM_WORDS = ["gagner argent","gagne de l'argent","investissement","bitcoin","crypto","envoie moi","send me","je te donne","click here","clique ici","compte bloqué","votre compte","vérification urgente","urgence","félicitations","vous avez gagné","prize","winner"];
const BLOCKED_LINKS = ["chat.whatsapp.com","bit.ly","t.me","https://","http://","www."];

function loadBadWords(jid) {
  const FILE = "./badwords.json";
  try {
    const data = JSON.parse(fs.readFileSync(FILE, "utf-8"));
    return data[jid] || [];
  } catch { return []; }
}

async function isBotAdmin(natsu, groupId) {
  try {
    const meta = await natsu.groupMetadata(groupId);
    const botNum = (natsu.user?.id || "").split(":")[0].split("@")[0];
    const bot = meta.participants.find(p => p.id.split(":")[0].split("@")[0] === botNum);
    return bot?.admin != null;
  } catch { return false; }
}

function getText(msg) {
  const m = msg?.message;
  return (m?.conversation || m?.extendedTextMessage?.text || m?.imageMessage?.caption || m?.videoMessage?.caption || "");
}

export function antiLink(natsu) {
  natsu.ev.on("messages.upsert", async ({ messages }) => {
    if (!statusProtections.antiLink) return;
    const msg = messages[0];
    if (!msg?.message || msg.key.fromMe) return;
    const from = msg.key.remoteJid;
    if (!from.endsWith("@g.us")) return;
    const sender = msg.key.participant || from;
    const text = getText(msg);
    if (!text) return;
    try {
      const meta = await natsu.groupMetadata(from);
      const info = meta.participants.find(p => p.id === sender);
      if (info?.admin) return;
      if (BLOCKED_LINKS.some(l => text.toLowerCase().includes(l))) {
        await natsu.sendMessage(from, { delete: msg.key });
        await natsu.sendMessage(from, { text: `╭═══🛡️ ANTI-LINK ═══╮\n│ ⚠️ @${sender.split("@")[0]}, les liens sont interdits !\n╰━━━━━━━━━━━━━━━━≽`, mentions: [sender] });
        const isAdmin = await isBotAdmin(natsu, from);
        if (isAdmin) await natsu.groupParticipantsUpdate(from, [sender], "remove");
      }
    } catch (e) { if (!String(e).includes("Bad MAC")) console.log("[WARN][ANTILINK]", e?.message); }
  });
}

export function antiLove(natsu) {
  natsu.ev.on("messages.upsert", async ({ messages }) => {
    if (!statusProtections.antiLove) return;
    const msg = messages[0];
    if (!msg?.message || msg.key.fromMe) return;
    const from = msg.key.remoteJid;
    if (!from.endsWith("@g.us")) return;
    const sender = msg.key.participant || from;
    const text = getText(msg).toLowerCase();
    if (!text) return;
    try {
      const meta = await natsu.groupMetadata(from);
      if (meta.participants.find(p => p.id === sender)?.admin) return;
      if (LOVE_WORDS.some(w => text.includes(w))) {
        await natsu.sendMessage(from, { delete: msg.key });
        await natsu.sendMessage(from, { text: `╭═══💔 ANTI-LOVE ═══╮\n│ ⚠️ @${sender.split("@")[0]}, messages romantiques interdits !\n╰━━━━━━━━━━━━━━━━≽`, mentions: [sender] });
      }
    } catch (e) { if (!String(e).includes("Bad MAC")) console.log("[WARN][ANTILOVE]", e?.message); }
  });
}

export function antiTag(natsu) {
  natsu.ev.on("messages.upsert", async ({ messages }) => {
    if (!statusProtections.antiTag) return;
    const msg = messages[0];
    if (!msg?.message || msg.key.fromMe) return;
    const from = msg.key.remoteJid;
    if (!from.endsWith("@g.us")) return;
    const sender = msg.key.participant || from;
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentioned.length < 5) return;
    try {
      const meta = await natsu.groupMetadata(from);
      if (meta.participants.find(p => p.id === sender)?.admin) return;
      await natsu.sendMessage(from, { delete: msg.key });
      await natsu.sendMessage(from, { text: `╭═══🏷️ ANTI-TAG ═══╮\n│ ⚠️ @${sender.split("@")[0]}, mentions en masse interdites !\n╰━━━━━━━━━━━━━━━━≽`, mentions: [sender] });
    } catch (e) { if (!String(e).includes("Bad MAC")) console.log("[WARN][ANTITAG]", e?.message); }
  });
}

export function antiSticker(natsu) {
  natsu.ev.on("messages.upsert", async ({ messages }) => {
    if (!statusProtections.antiSticker) return;
    const msg = messages[0];
    if (!msg?.message || msg.key.fromMe) return;
    const from = msg.key.remoteJid;
    if (!from.endsWith("@g.us")) return;
    const sender = msg.key.participant || from;
    if (!msg.message.stickerMessage) return;
    try {
      const meta = await natsu.groupMetadata(from);
      if (meta.participants.find(p => p.id === sender)?.admin) return;
      await natsu.sendMessage(from, { delete: msg.key });
      await natsu.sendMessage(from, { text: `╭═══🎭 ANTI-STICKER ═══╮\n│ ⚠️ @${sender.split("@")[0]}, stickers interdits !\n╰━━━━━━━━━━━━━━━━≽`, mentions: [sender] });
    } catch (e) { if (!String(e).includes("Bad MAC")) console.log("[WARN][ANTISTICKER]", e?.message); }
  });
}

export function antiInsult(natsu) {
  natsu.ev.on("messages.upsert", async ({ messages }) => {
    if (!statusProtections.antiInsult) return;
    const msg = messages[0];
    if (!msg?.message || msg.key.fromMe) return;
    const from = msg.key.remoteJid;
    if (!from.endsWith("@g.us")) return;
    const sender = msg.key.participant || from;
    const text = getText(msg).toLowerCase();
    if (!text) return;
    try {
      const meta = await natsu.groupMetadata(from);
      if (meta.participants.find(p => p.id === sender)?.admin) return;
      if (INSULT_WORDS.some(w => text.includes(w))) {
        await natsu.sendMessage(from, { delete: msg.key });
        await natsu.sendMessage(from, { text: `╭═══🤬 ANTI-INSULTE ═══╮\n│ ⚠️ @${sender.split("@")[0]}, langage offensant interdit !\n╰━━━━━━━━━━━━━━━━≽`, mentions: [sender] });
      }
    } catch (e) { if (!String(e).includes("Bad MAC")) console.log("[WARN][ANTIINSULT]", e?.message); }
  });
}

export function antiScam(natsu) {
  natsu.ev.on("messages.upsert", async ({ messages }) => {
    if (!statusProtections.antiScam) return;
    const msg = messages[0];
    if (!msg?.message || msg.key.fromMe) return;
    const from = msg.key.remoteJid;
    if (!from.endsWith("@g.us")) return;
    const sender = msg.key.participant || from;
    const text = getText(msg).toLowerCase();
    if (!text) return;
    try {
      const meta = await natsu.groupMetadata(from);
      if (meta.participants.find(p => p.id === sender)?.admin) return;
      if (SCAM_WORDS.some(w => text.includes(w))) {
        await natsu.sendMessage(from, { delete: msg.key });
        await natsu.sendMessage(from, { text: `╭═══🚨 ANTI-SCAM ═══╮\n│ ⚠️ @${sender.split("@")[0]}, messages d'arnaque interdits !\n╰━━━━━━━━━━━━━━━━≽`, mentions: [sender] });
      }
    } catch (e) { if (!String(e).includes("Bad MAC")) console.log("[WARN][ANTISCAM]", e?.message); }
  });
}

export function antiBadWord(natsu) {
  natsu.ev.on("messages.upsert", async ({ messages }) => {
    if (!statusProtections.antiBadWord) return;
    const msg = messages[0];
    if (!msg?.message || msg.key.fromMe) return;
    const from = msg.key.remoteJid;
    if (!from.endsWith("@g.us")) return;
    const sender = msg.key.participant || from;
    const text = getText(msg).toLowerCase();
    if (!text) return;
    try {
      const meta = await natsu.groupMetadata(from);
      if (meta.participants.find(p => p.id === sender)?.admin) return;
      const words = loadBadWords(from);
      if (words.some(w => text.includes(w))) {
        await natsu.sendMessage(from, { delete: msg.key });
        await natsu.sendMessage(from, { text: `╭═══🚫 ANTI-BADWORD ═══╮\n│ ⚠️ @${sender.split("@")[0]}, mot interdit détecté !\n╰━━━━━━━━━━━━━━━━≽`, mentions: [sender] });
      }
    } catch (e) { if (!String(e).includes("Bad MAC")) console.log("[WARN][ANTIBADWORD]", e?.message); }
  });
}

export function antiFake(natsu) {
  natsu.ev.on("group-participants.update", async (update) => {
    if (!statusProtections.antiFake) return;
    if (update.action !== "add") return;
    try {
      const isAdmin = await isBotAdmin(natsu, update.id);
      if (!isAdmin) return;
      for (const p of update.participants) {
        const num = p.split("@")[0];
        if (num.length < 7 || num.length > 15 || /^0{4,}/.test(num)) {
          await natsu.groupParticipantsUpdate(update.id, [p], "remove");
          await natsu.sendMessage(update.id, { text: `╭═══🕵️ ANTI-FAKE ═══╮\n│ 🚫 Numéro suspect bloqué : +${num}\n╰━━━━━━━━━━━━━━━━≽` });
        }
      }
    } catch (e) { if (!String(e).includes("Bad MAC")) console.log("[WARN][ANTIFAKE]", e?.message); }
  });
}

export function antiVirtual(natsu) {
  natsu.ev.on("group-participants.update", async (update) => {
    if (!statusProtections.antiVirtual) return;
    if (update.action !== "add") return;
    const VIRTUAL_PREFIXES = ["1900","1800","020","0800","1000","1111","99","88","77","66"];
    try {
      const isAdmin = await isBotAdmin(natsu, update.id);
      if (!isAdmin) return;
      for (const p of update.participants) {
        const num = p.split("@")[0];
        const isVirtual = num.length > 14 || VIRTUAL_PREFIXES.some(pfx => num.startsWith(pfx));
        if (isVirtual) {
          await natsu.groupParticipantsUpdate(update.id, [p], "remove");
          await natsu.sendMessage(update.id, { text: `╭═══📵 ANTI-VIRTUEL ═══╮\n│ 🚫 Numéro virtuel bloqué : +${num}\n╰━━━━━━━━━━━━━━━━≽` });
        }
      }
    } catch (e) { if (!String(e).includes("Bad MAC")) console.log("[WARN][ANTIVIRTUAL]", e?.message); }
  });
}

export function antiRaid(natsu) {
  natsu.ev.on("group-participants.update", async (update) => {
    if (!statusProtections.antiRaid) return;
    if (update.action !== "add") return;
    const jid = update.id;
    const now = Date.now();
    if (!raidHistory[jid]) raidHistory[jid] = [];
    for (const p of update.participants) raidHistory[jid].push({ p, t: now });
    raidHistory[jid] = raidHistory[jid].filter(r => now - r.t < 30000);
    if (raidHistory[jid].length >= 5) {
      const toKick = raidHistory[jid].map(r => r.p);
      raidHistory[jid] = [];
      try {
        const isAdmin = await isBotAdmin(natsu, jid);
        if (isAdmin) {
          await natsu.groupParticipantsUpdate(jid, toKick, "remove");
          await natsu.sendMessage(jid, {
            text: `╭═══🛡️ ANTI-RAID 𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣 🛡️═══╮\n│ 🚨 Tentative de RAID détectée !\n│ 🚫 ${toKick.length} comptes expulsés.\n│ 🔒 Groupe sécurisé.\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯`,
          });
        }
      } catch (e) { if (!String(e).includes("Bad MAC")) console.log("[WARN][ANTIRAID]", e?.message); }
    }
  });
}

export function antiChange(natsu) {
  natsu.ev.on("groups.update", async (updates) => {
    if (!statusProtections.antiChange) return;
    for (const update of updates) {
      try {
        const meta = await natsu.groupMetadata(update.id);
        const isAdmin = await isBotAdmin(natsu, update.id);
        if (!isAdmin) continue;
        await natsu.sendMessage(update.id, {
          text: `╭═══🔒 ANTI-CHANGE 𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣 🔒═══╮\n│ ⚠️ Modification du groupe détectée !\n│ 📌 Groupe : ${meta.subject}\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯`,
        });
      } catch (e) { if (!String(e).includes("Bad MAC")) console.log("[WARN][ANTICHANGE]", e?.message); }
    }
  });
}

export function welcome(natsu) {
  natsu.ev.on("group-participants.update", async (update) => {
    if (!statusProtections.welcome) return;
    if (update.action !== "add") return;
    try {
      const meta = await natsu.groupMetadata(update.id);
      for (const p of update.participants) {
        let pp = null;
        try { pp = await natsu.profilePictureUrl(p, "image"); } catch {}
        const text =
          `╭═══👋 BIENVENUE ═══╮\n` +
          `│ 🎉 Bienvenue @${p.split("@")[0]} !\n` +
          `│ 📌 Groupe : *${meta.subject}*\n` +
          `│ 👥 Membres : ${meta.participants.length}\n` +
          `│ 📜 Tape .rules pour les règles\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
          `> 𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣`;
        if (pp) {
          await natsu.sendMessage(update.id, { image: { url: pp }, caption: text, mentions: [p] });
        } else {
          await natsu.sendMessage(update.id, { text, mentions: [p] });
        }
      }
    } catch (e) { if (!String(e).includes("Bad MAC")) console.log("[WARN][WELCOME]", e?.message); }
  });
}

export function goodbye(natsu) {
  natsu.ev.on("group-participants.update", async (update) => {
    if (!statusProtections.goodbye) return;
    if (update.action !== "remove" && update.action !== "leave") return;
    try {
      const meta = await natsu.groupMetadata(update.id);
      for (const p of update.participants) {
        await natsu.sendMessage(update.id, {
          text:
            `╭═══👋 AU REVOIR ═══╮\n` +
            `│ 😢 @${p.split("@")[0]} a quitté le groupe.\n` +
            `│ 📌 ${meta.subject}\n` +
            `╰━━━━━━━━━━━━━━━━━━━━━━━━╯`,
          mentions: [p],
        });
      }
    } catch (e) { if (!String(e).includes("Bad MAC")) console.log("[WARN][GOODBYE]", e?.message); }
  });
}

export function antiFlood(natsu) {
  natsu.ev.on("messages.upsert", async ({ messages }) => {
    if (!statusProtections.antiFlood) return;
    const msg = messages[0];
    if (!msg?.message || msg.key.fromMe) return;
    const from = msg.key.remoteJid;
    if (!from.endsWith("@g.us")) return;
    const sender = msg.key.participant || from;
    const isMedia = !!(msg.message.imageMessage || msg.message.videoMessage || msg.message.audioMessage || msg.message.documentMessage);
    if (!isMedia) return;
    try {
      const meta = await natsu.groupMetadata(from);
      if (meta.participants.find(p => p.id === sender)?.admin) return;
      const now = Date.now();
      if (!floodHistory[sender]) floodHistory[sender] = [];
      floodHistory[sender].push(now);
      floodHistory[sender] = floodHistory[sender].filter(t => now - t < 10000);
      if (floodHistory[sender].length >= 5) {
        floodHistory[sender] = [];
        await natsu.sendMessage(from, { delete: msg.key });
        await natsu.sendMessage(from, { text: `╭═══🌊 ANTI-FLOOD ═══╮\n│ ⚠️ @${sender.split("@")[0]}, arrête les médias en rafale !\n╰━━━━━━━━━━━━━━━━≽`, mentions: [sender] });
        const isAdmin = await isBotAdmin(natsu, from);
        if (isAdmin) await natsu.groupParticipantsUpdate(from, [sender], "remove");
      }
    } catch (e) { if (!String(e).includes("Bad MAC")) console.log("[WARN][ANTIFLOOD]", e?.message); }
  });
}

export function antiPromote(natsu) {
  natsu.ev.on("group-participants.update", async (update) => {
    if (!statusProtections.antiPromote) return;
    if (update.action !== "promote") return;
    try {
      const isAdmin = await isBotAdmin(natsu, update.id);
      for (const p of update.participants) {
        await natsu.groupParticipantsUpdate(update.id, [p], "demote");
        if (isAdmin) await natsu.groupParticipantsUpdate(update.id, [p], "remove");
      }
    } catch (e) { if (!String(e).includes("Bad MAC")) console.log("[WARN][ANTIPROMOTE]", e?.message); }
  });
}

export function antiDemote(natsu) {
  natsu.ev.on("group-participants.update", async (update) => {
    if (!statusProtections.antiDemote) return;
    if (update.action !== "demote") return;
    try {
      const isAdmin = await isBotAdmin(natsu, update.id);
      for (const p of update.participants) {
        await natsu.groupParticipantsUpdate(update.id, [p], "promote");
        if (isAdmin) await natsu.groupParticipantsUpdate(update.id, [p], "remove");
      }
    } catch (e) { if (!String(e).includes("Bad MAC")) console.log("[WARN][ANTIDEMOTE]", e?.message); }
  });
}

export function antiBot(natsu) {
  natsu.ev.on("group-participants.update", async (update) => {
    if (!statusProtections.antiBot) return;
    if (update.action !== "add") return;
    try {
      const isAdmin = await isBotAdmin(natsu, update.id);
      for (const p of update.participants) {
        const num = p.split("@")[0];
        if (num.length > 15 || num.startsWith("0")) {
          if (isAdmin) {
            await natsu.groupParticipantsUpdate(update.id, [p], "remove");
            await natsu.sendMessage(update.id, { text: `╭═══🤖 ANTI-BOT ═══╮\n│ 🚫 Bot suspect expulsé : ${num}\n╰━━━━━━━━━━━━━━━━≽` });
          }
        }
      }
    } catch (e) { if (!String(e).includes("Bad MAC")) console.log("[WARN][ANTIBOT]", e?.message); }
  });
}

export function antiSpam(natsu) {
  natsu.ev.on("messages.upsert", async ({ messages }) => {
    if (!statusProtections.antiSpam) return;
    const msg = messages[0];
    if (!msg?.message || msg.key.fromMe) return;
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || from;
    const timestamp = msg.messageTimestamp * 1000;
    if (!from.endsWith("@g.us")) return;
    try {
      const meta = await natsu.groupMetadata(from);
      if (meta.participants.find(p => p.id === sender)?.admin) return;
      if (!messageHistory[sender]) messageHistory[sender] = [];
      messageHistory[sender].unshift({ key: msg.key, timestamp });
      if (messageHistory[sender].length > SPAM_LIMIT) messageHistory[sender].pop();
      if (messageHistory[sender].length === SPAM_LIMIT) {
        const newest = messageHistory[sender][0].timestamp;
        const oldest = messageHistory[sender][SPAM_LIMIT - 1].timestamp;
        if (newest - oldest <= TIME_LIMIT_MS) {
          const keys = messageHistory[sender].map(m => m.key);
          await Promise.allSettled(keys.map(k => natsu.sendMessage(from, { delete: k })));
          messageHistory[sender] = [];
          await natsu.sendMessage(from, { text: `╭═══✅ ANTI-SPAM ═══╮\n│ 🚫 @${sender.split("@")[0]} — spam détecté.\n╰━━━━━━━━━━━━━━━━≽`, mentions: [sender] });
        }
      }
    } catch (e) { if (!String(e).includes("Bad MAC")) console.log("[WARN][ANTISPAM]", e?.message); }
  });
}

export function warnAdmin(natsu) {
  natsu.ev.on("group-participants.update", async (update) => {
    if (!statusProtections.warnAdmin) return;
    try {
      const meta = await natsu.groupMetadata(update.id);
      if (update.action === "promote" || update.action === "demote") {
        for (const p of update.participants) {
          await natsu.sendMessage(update.id, {
            text: `╭═══⚔️ ALERTE ADMIN 𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣 ⚔️═══╮\n│ 📌 Groupe : *${meta.subject}*\n│ ${update.action === "promote" ? `👑 @${p.split("@")[0]} promu admin !` : `⚠️ @${p.split("@")[0]} rétrogradé !`}\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯`,
            mentions: [p],
          });
        }
      }
    } catch (e) { if (!String(e).includes("Bad MAC")) console.log("[WARN][WARNADMIN]", e?.message); }
  });
}

export function initProtections(natsu) {
  antiLink(natsu);
  antiLove(natsu);
  antiTag(natsu);
  antiSticker(natsu);
  antiInsult(natsu);
  antiScam(natsu);
  antiBadWord(natsu);
  antiFake(natsu);
  antiVirtual(natsu);
  antiRaid(natsu);
  antiChange(natsu);
  antiFlood(natsu);
  antiPromote(natsu);
  antiDemote(natsu);
  antiBot(natsu);
  antiSpam(natsu);
  warnAdmin(natsu);
  welcome(natsu);
  goodbye(natsu);
}
