import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
  isJidBroadcast,
  proto,
} from "@whiskeysockets/baileys";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { initProtections } from "./protections.js";
import { startNightmodeTimers } from "./commands/nightmode.js";
import { initTimeCapsules } from "./commands/timecapsule.js";
import {
  initTelegramBot,
  waitForPhoneNumber,
  sendPairingCode,
  notifyConnected,
  notifyDisconnected,
} from "./telegram.js";
dotenv.config();
import { EventEmitter } from "events";
EventEmitter.defaultMaxListeners = 50;

const config = {
  PREFIX: process.env.PREFIXE || ".",
  AUTH_DIR: process.env.DOSSIER_AUTH || "auth_baileys",
  USE_QR: process.env.USE_QR === "true",
  RECONNECT_DELAY: parseInt(process.env.RECONNECT_DELAY) || 5000,
};

export const BOT_NAME = "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣";
export const BOT_VERSION = "2.0";
export const BOT_DEV = "𝛁𝚫𝚪𝚴𝚯𝚾 𝚸𝚪𝚰𝚳𝚵𝚵𝚵𝚵";
export const OWNER_NUMBERS = (process.env.OWNER_NUMBERS || "224610835573,224669288332").split(",").map((n) => n.trim().replace(/[^0-9]/g, ""));
export const OWNER_NAMES = { "224610835573": "VARNOX", "224669288332": "PRIMEE" };
export const CHANNELS = {
  whatsapp1: "https://whatsapp.com/channel/0029VbD1VM09Bb5zhsXYeI2n",
  whatsapp2: "https://whatsapp.com/channel/0029Vb7q4urGehEDh39zll3H",
  telegram1: "t.me/Varnox_Or_novark",
  telegram2: "t.me/varnox_official",
};
export const OFFICIAL_CHANNEL = "https://whatsapp.com/channel/0029VbD1VM09Bb5zhsXYeI2n";
export const BOT_IMAGE = "https://files.catbox.moe/cceb4k.jpg";
export const MENU_AUDIO = "https://gangalink.vercel.app/i/x9l8efb8.mp4";

const log = {
  info:  (...a) => console.log("[INFO]",  ...a),
  warn:  (...a) => console.log("[WARN]",  ...a),
  error: (...a) => console.log("[ERROR]", ...a),
};
const silentLogger = {
  level: "silent", child: () => silentLogger,
  info: ()=>{}, warn: ()=>{}, error: ()=>{},
  debug: ()=>{}, trace: ()=>{}, fatal: ()=>{},
};

const SUDO_FILE = "./sudo.json";
export function loadSudo() {
  if (!fs.existsSync(SUDO_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(SUDO_FILE, "utf-8")); } catch { return []; }
}
export function saveSudo(list) { fs.writeFileSync(SUDO_FILE, JSON.stringify(list, null, 2)); }
export function addSudo(num) {
  const s = new Set(loadSudo()); s.add(num); saveSudo([...s]); return [...s];
}
export function removeSudo(num) {
  const list = loadSudo().filter((n) => n !== num); saveSudo(list); return list;
}
export function isSudo(num) { return loadSudo().includes(num); }

export function normalizeJid(jid) {
  if (!jid) return null;
  const bare = String(jid).trim().split(":")[0];
  return bare.includes("@") ? bare : bare + "@s.whatsapp.net";
}
export function getBareNumber(jid) {
  if (!jid) return "";
  return String(jid).split("@")[0].split(":")[0].replace(/[^0-9]/g, "");
}
export function normalizeNumber(raw) {
  if (!raw) return null;
  const n = String(raw).replace(/[^0-9]/g, "");
  return n.length >= 7 ? n : null;
}

function pickText(message) {
  if (!message) return;
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    message.buttonsResponseMessage?.selectedButtonId ||
    message.listResponseMessage?.singleSelectReply?.selectedRowId ||
    message.templateButtonReplyMessage?.selectedId ||
    message.interactiveResponseMessage?.text
  );
}

function unwrapMessage(msg) {
  return (
    msg?.viewOnceMessage?.message ||
    msg?.viewOnceMessageV2?.message ||
    msg?.ephemeralMessage?.message ||
    msg?.documentWithCaptionMessage?.message ||
    msg
  );
}

function afficherBanner() {
  try { console.clear(); } catch {}
  console.log("\n=============================================");
  console.log("   𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣   -  SYSTEM ONLINE  ⚡");
  console.log("   Bot WhatsApp Baileys + Node.js + Telegram");
  console.log("=============================================\n");
}

const emojiMap = {
  menu: "📋", ping: "🏓", infos: "🗒️", owner: "👑", device: "📱",
  delete: "🗑️", vv: "👁️", whois: "🖼️", bio: "👤", setpp: "🖼️", autorecording: "🎙️",
  sticker: "🖼️", save: "💾", photo: "🖼️", url: "🔗", add: "👥",
  kick: "❌", kickall: "😼", tagall: "🌍", tag: "👥", tagadmin: "👑",
  hidetag: "👁️", everyone: "📢",
  promote: "↗️", demote: "↘️", demoteall: "↘️", promoteall: "↗️",
  gclink: "🔗", resetlink: "🔄", left: "👋", mute: "🔇", unmute: "🔊", purge: "⚜️",
  principal: "👑", setppg: "🖼️", settimeg: "⏰", writetoall: "📣", broadcast: "📡",
  rules: "📜", setrules: "✏️", setdesc: "📝", setname: "✏️",
  warn: "⚠️", unwarn: "✅", listwarn: "📋",
  nightmode: "🌙", admins: "👑", count: "📊", listmembers: "📋",
  pin: "📌", protect: "🛡️",
  addbadword: "➕", delbadword: "🗑️", listbadword: "📋", antibadword: "🚫",
  welcome: "👋", goodbye: "👋",
  wasted: "💀", antibot: "🤖", antidemote: "⚜️", antilink: "🔗",
  antipromote: "⚜️", antispam: "✅", warnadmin: "⚔️", listonline: "🟢",
  antilove: "💔", antitag: "🏷️", antisticker: "🎭", antiinsult: "🤬",
  antifake: "🕵️", antiflood: "🌊", antiraid: "🛡️", antiscam: "🚨",
  antichange: "🔒", antivirtual: "📵",
  delsudo: "❌", listsudo: "📋", setsudo: "✅", "mute-time": "⏰",
  hijack: "🔒", phantom: "👻", timecapsule: "⏳", inception: "🌀",
  mirrordimension: "🪞", sleepwalk: "🌙", paradox: "🔄", glitch: "⚡",
  ghostmention: "👁️", blackhole: "🕳️", "anime-quizz": "🎌", searchnumber: "🔍",
};

const msgStore = new Map();

log.info("Démarrage 𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣...");

initTelegramBot();

startBot();

async function startBot() {
  try {
    let version;
    try {
      const res = await fetchLatestBaileysVersion();
      version = res.version;
      log.info("Version Baileys : " + version.join("."));
    } catch {
      version = [2, 3000, 1015901307];
      log.warn("Version Baileys de secours utilisée");
    }

    const { state, saveCreds } = await useMultiFileAuthState(config.AUTH_DIR);

    const natsu = makeWASocket({
      version,
      logger: silentLogger,
      printQRInTerminal: config.USE_QR,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, silentLogger),
      },
      msgRetryCounterCache: new Map(),
      browser: ["Ubuntu", "Chrome", "20.0.04"],
      generateHighQualityLinkPreview: true,
      getMessage: async (key) => {
        const stored = msgStore.get(key.id);
        if (stored) return stored;
        return proto.Message.fromObject({ conversation: "" });
      },
    });

    natsu.ev.on("creds.update", saveCreds);

    natsu.ev.on("messages.upsert", ({ messages }) => {
      for (const msg of messages) {
        if (msg.key?.id && msg.message) {
          msgStore.set(msg.key.id, msg.message);
          if (msgStore.size > 500) {
            const firstKey = msgStore.keys().next().value;
            msgStore.delete(firstKey);
          }
        }
      }
    });

    natsu.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr && config.USE_QR) {
        try {
          const { default: qrcode } = await import("qrcode-terminal");
          console.log("\n📱 Scanne ce QR avec WhatsApp :\n");
          qrcode.generate(qr, { small: true });
        } catch {}
      }

      if (connection === "open") {
        log.info("✅ Bot connecté !");
        afficherBanner();
        try {
          const userJid = natsu.user?.id || null;
          const bareConnected = getBareNumber(userJid);
          global.owners = bareConnected ? [bareConnected, ...OWNER_NUMBERS] : [...OWNER_NUMBERS];
          global.owners = [...new Set(global.owners)];
          log.info("Propriétaires : " + global.owners.join(", "));

          notifyConnected(bareConnected || "Inconnu");
        } catch {
          global.owners = [...OWNER_NUMBERS];
        }

        global.BOT_NAME = BOT_NAME;

        try { initProtections(natsu); } catch (e) { log.error("Erreur initProtections: " + e?.message); }
        try { startNightmodeTimers(natsu); } catch (e) { log.error("Erreur nightmode: " + e?.message); }
        try { initTimeCapsules(natsu); } catch (e) { log.error("Erreur timecapsule init: " + e?.message); }

        global.commands = {};
        const cmdDir = "./commands";
        if (fs.existsSync(cmdDir)) {
          const cmdFiles = fs.readdirSync(cmdDir).filter((f) => f.endsWith(".js"));
          for (const file of cmdFiles) {
            try {
              const mod = await import(path.resolve(cmdDir, file));
              const cmd = mod.default ?? mod;
              if (cmd?.name && typeof cmd.execute === "function") global.commands[cmd.name] = cmd;
            } catch (e) { log.warn("Échec import " + file + ": " + (e?.message ?? e)); }
          }
        }
        log.info(Object.keys(global.commands).length + " commandes chargées");

        await autoSendChannelLink(natsu);

        try {
          const selfJid = natsu.user?.id || null;
          const bareJid = selfJid ? selfJid.split(":")[0] : null;
          if (bareJid) {
            await natsu.sendMessage(normalizeJid(bareJid), {
              image: { url: BOT_IMAGE },
              caption: "🎉 𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣 est ACTIF !\n\nTape " + config.PREFIX + "menu pour les commandes",
            });
          }
        } catch {}
      }

      if (connection === "close") {
        let reason = "unknown";
        try { reason = lastDisconnect?.error?.output?.statusCode ?? lastDisconnect?.error?.message ?? String(lastDisconnect); } catch {}
        log.error("Déconnecté : " + reason);

        const loggedOut =
          lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut ||
          /loggedOut/i.test(String(reason));

        notifyDisconnected(String(reason));

        if (!loggedOut) {
          log.warn("Reconnexion dans " + config.RECONNECT_DELAY + " ms...");
          setTimeout(startBot, config.RECONNECT_DELAY);
        } else {
          log.warn("Session expirée — suppression automatique et re-pairing Telegram...");
          try {
            const authDir = config.AUTH_DIR;
            if (fs.existsSync(authDir)) {
              const files = fs.readdirSync(authDir);
              for (const f of files) {
                try { fs.unlinkSync(path.join(authDir, f)); } catch {}
              }
              log.info("Session effacée. Redémarrage pour nouveau pairing...");
            }
          } catch (e) { log.error("Erreur suppression session: " + e?.message); }
          setTimeout(startBot, config.RECONNECT_DELAY);
        }
      }
    });

    setTimeout(async () => {
      try {
        if (!state.creds?.registered && !config.USE_QR) {
          await doPairingViaTelegram(natsu);
        }
      } catch (e) { log.warn("Erreur pairing: " + e?.message); }
    }, 3000);

    natsu.ev.on("messages.upsert", async ({ messages }) => {
      try {
        const msg = messages?.[0];
        if (!msg?.message) return;

        const from = msg.key.remoteJid;
        if (!from || isJidBroadcast(from)) return;

        const isGroup = from.endsWith("@g.us");
        let sender = msg.key.fromMe
          ? natsu.user?.id
          : isGroup
          ? msg.key.participant
          : msg.key.remoteJid;

        if (!sender) return;
        if (String(sender).includes("@lid")) {
          try { sender = natsu.decodeJid(sender); } catch {}
        }

        const senderNum = getBareNumber(sender);
        const ownersNums = (global.owners || []).map(getBareNumber);
        const sudoNums = loadSudo().map(getBareNumber);
        if (!ownersNums.includes(senderNum) && !sudoNums.includes(senderNum)) return;

        // Vérification blackhole — bloque les commandes pour les utilisateurs blacklistés
        if (!ownersNums.includes(senderNum) && (global.blackholedUsers || new Set()).has(senderNum)) {
          try { await natsu.sendMessage(from, { text: "> ❌ Commande inconnue." }, { quoted: msg }); } catch {}
          return;
        }

        const rawMsg = unwrapMessage(msg.message);
        const body = pickText(rawMsg);
        if (!body || !body.startsWith(config.PREFIX)) return;

        const args = body.slice(config.PREFIX.length).trim().split(/ +/);
        const commandName = (args.shift() || "").toLowerCase();
        const cmd = global.commands?.[commandName];

        try { await natsu.sendMessage(from, { react: { text: "📡", key: msg.key } }); } catch {}

        if (cmd) {
          const emoji = emojiMap[commandName];
          if (emoji) { try { await natsu.sendMessage(from, { react: { text: emoji, key: msg.key } }); } catch {} }
          try {
            if (typeof cmd.execute === "function") await cmd.execute(natsu, msg, args, from);
            else if (typeof cmd === "function") await cmd(natsu, msg, args, from);
          } catch (e) {
            log.error("Erreur commande " + commandName + ": " + e?.message);
            try {
              await natsu.sendMessage(from, {
                text: "> ⚠️ Erreur lors de l'exécution de la commande : " + commandName,
              }, { quoted: msg });
            } catch {}
          }
        }
      } catch (e) {
        if (e?.message?.includes("Bad MAC") || e?.message?.includes("decrypt")) return;
        log.warn("Erreur messages.upsert: " + e?.message);
      }
    });

  } catch (e) {
    log.error("Erreur critique: " + (e?.message ?? e));
    setTimeout(startBot, config.RECONNECT_DELAY);
  }
}

async function doPairingViaTelegram(natsu) {
  if (typeof natsu.requestPairingCode !== "function") {
    log.warn("requestPairingCode non disponible");
    return;
  }

  log.info("En attente du numéro WhatsApp via Telegram...");
  const number = await waitForPhoneNumber();

  if (!number) {
    log.error("Aucun numéro fourni — impossible de faire le pairing.");
    return;
  }

  log.info("Demande du code de pairing pour : " + number);
  try {
    const code = await natsu.requestPairingCode(number);
    sendPairingCode(code);

    const afficher = () => {
      console.log("\n╔══════════════════════════════════════════════╗");
      console.log("║   🔑  CODE DE LIAISON WHATSAPP               ║");
      console.log("║                                              ║");
      console.log("║     >>>  " + String(code) + "  <<<                  ║");
      console.log("║                                              ║");
      console.log("╚══════════════════════════════════════════════╝\n");
    };
    afficher();
    const iv = setInterval(afficher, 15000);
    setTimeout(() => clearInterval(iv), 120000);
  } catch (err) {
    log.error("Échec code pairing: " + (err?.message ?? err));
  }
}

async function autoSendChannelLink(natsu) {
  try {
    const selfJid = natsu.user?.id || null;
    const bareJid = selfJid ? selfJid.split(":")[0] : null;
    if (!bareJid) return;
    await natsu.sendMessage(normalizeJid(bareJid), {
      text: `📡 *𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣 — Canal Officiel*\n\nRejoins le canal pour les mises à jour du bot :\n\n${OFFICIAL_CHANNEL}`,
    });
  } catch {}
}

process.on("unhandledRejection", (r) => {
  const msg = String(r);
  if (msg.includes("Bad MAC") || msg.includes("decrypt") || msg.includes("No sessions")) return;
  log.error("Rejection: " + msg);
});
process.on("uncaughtException", (e) => {
  const msg = e?.message || String(e);
  if (msg.includes("Bad MAC") || msg.includes("decrypt") || msg.includes("No sessions")) return;
  log.error("Exception: " + msg);
});
