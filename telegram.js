import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const CHAT_ID_FILE = "./tg_chatid.json";

const log = {
  info:  (...a) => console.log("[TG INFO]",  ...a),
  warn:  (...a) => console.log("[TG WARN]",  ...a),
  error: (...a) => console.log("[TG ERROR]", ...a),
};

let bot = null;
let pairingResolver = null;
let pendingChatId = loadChatId();

function loadChatId() {
  try {
    if (fs.existsSync(CHAT_ID_FILE)) {
      const data = JSON.parse(fs.readFileSync(CHAT_ID_FILE, "utf-8"));
      return data.chatId || null;
    }
  } catch {}
  return null;
}

function saveChatId(chatId) {
  try { fs.writeFileSync(CHAT_ID_FILE, JSON.stringify({ chatId })); } catch {}
}

const ALLOWED_CHAT_IDS = process.env.TELEGRAM_ALLOWED_IDS
  ? process.env.TELEGRAM_ALLOWED_IDS.split(",").map((s) => s.trim())
  : [];

function isAllowed(chatId) {
  if (ALLOWED_CHAT_IDS.length === 0) return true;
  return ALLOWED_CHAT_IDS.includes(String(chatId));
}

export function initTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    log.error("TELEGRAM_BOT_TOKEN manquant — le pairing Telegram est désactivé.");
    return null;
  }

  bot = new TelegramBot(token, { polling: true });
  log.info("Bot Telegram démarré et en écoute...");

  bot.on("polling_error", (err) => {
    log.error("Erreur polling Telegram: " + (err?.message ?? err));
  });

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    if (!isAllowed(chatId)) {
      bot.sendMessage(chatId, "⛔ Accès refusé.");
      return;
    }
    pendingChatId = chatId;
    saveChatId(chatId);
    bot.sendMessage(
      chatId,
      `╔═══════════════════════════════════╗\n` +
      `║  🤖  𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣 — Pairing Bot   ║\n` +
      `╚═══════════════════════════════════╝\n\n` +
      `Bienvenue ! Pour lier ton WhatsApp :\n\n` +
      `📱 Envoie ton numéro WhatsApp avec la commande :\n` +
      `*/pair 224XXXXXXXXX*\n\n` +
      `_Format international sans + (ex: 224669288332)_`,
      { parse_mode: "Markdown" }
    );
  });

  bot.onText(/\/pair(?:\s+(\d+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    if (!isAllowed(chatId)) {
      bot.sendMessage(chatId, "⛔ Accès refusé.");
      return;
    }

    pendingChatId = chatId;
    saveChatId(chatId);

    const number = match?.[1];
    if (!number || number.length < 7) {
      bot.sendMessage(
        chatId,
        "❌ Numéro invalide.\n\nUtilise : `/pair 224XXXXXXXXX`",
        { parse_mode: "Markdown" }
      );
      return;
    }

    if (!pairingResolver) {
      bot.sendMessage(
        chatId,
        "⏳ Le bot WhatsApp n'est pas encore prêt.\n\n_Attends quelques secondes et réessaie avec_ `/pair " + number + "`",
        { parse_mode: "Markdown" }
      );
      return;
    }

    bot.sendMessage(
      chatId,
      `⏳ Génération du code pour *${number}*...\n_Patiente quelques secondes_`,
      { parse_mode: "Markdown" }
    );

    pairingResolver(number);
    pairingResolver = null;
  });

  bot.onText(/\/status/, (msg) => {
    const chatId = msg.chat.id;
    if (!isAllowed(chatId)) return;
    const uptime = process.uptime();
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);
    bot.sendMessage(
      chatId,
      `✅ Bot actif depuis *${h}h ${m}m ${s}s*`,
      { parse_mode: "Markdown" }
    );
  });

  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    if (!isAllowed(chatId)) return;
    bot.sendMessage(
      chatId,
      `📋 *Commandes disponibles :*\n\n` +
      `/start — Message d'accueil\n` +
      `/pair 224XXXXXXXXX — Lier WhatsApp\n` +
      `/status — Statut du bot\n` +
      `/help — Ce message`,
      { parse_mode: "Markdown" }
    );
  });

  return bot;
}

export function waitForPhoneNumber() {
  return new Promise((resolve) => {
    if (!bot) {
      log.warn("Telegram bot non initialisé — en attente de NUMBER dans .env");
      const envNumber = process.env.NUMBER;
      if (envNumber) {
        log.info("Utilisation du numéro depuis .env: " + envNumber);
        resolve(envNumber.replace(/[^0-9]/g, ""));
      } else {
        log.error("Aucun numéro disponible. Configure NUMBER dans .env ou utilise Telegram.");
        resolve(null);
      }
      return;
    }

    log.info("En attente d'un numéro via Telegram...");

    // Notify saved chat if available
    if (pendingChatId) {
      try {
        bot.sendMessage(
          pendingChatId,
          `🔄 *Re-pairing nécessaire*\n\n` +
          `La session WhatsApp a expiré. Envoie :\n\n` +
          `*/pair 224XXXXXXXXX*\n\n` +
          `_Remplace par ton numéro WhatsApp_`,
          { parse_mode: "Markdown" }
        );
      } catch {}
    }

    pairingResolver = resolve;
  });
}

export function sendPairingCode(code) {
  const codeStr = String(code);
  if (!bot || !pendingChatId) {
    log.warn("Impossible d'envoyer le code Telegram: bot ou chatId manquant");
    console.log("\n╔══════════════════════════════════════════════╗");
    console.log("║   🔑  CODE DE LIAISON WHATSAPP               ║");
    console.log("║                                              ║");
    console.log("║     >>>  " + codeStr.padEnd(20) + "  <<<  ║");
    console.log("║                                              ║");
    console.log("╚══════════════════════════════════════════════╝\n");
    return;
  }
  bot.sendMessage(
    pendingChatId,
    `╔═══════════════════════════════════╗\n` +
    `║   🔑  CODE DE LIAISON WHATSAPP    ║\n` +
    `╚═══════════════════════════════════╝\n\n` +
    `🔢 Ton code :\n\n` +
    `*${codeStr}*\n\n` +
    `📱 *Instructions :*\n` +
    `1. Ouvre WhatsApp\n` +
    `2. ⋮ Menu → Appareils liés\n` +
    `3. Lier un appareil → Entrer le code\n\n` +
    `⏰ _Le code expire dans 2 minutes_`,
    { parse_mode: "Markdown" }
  );
  log.info("Code de pairing envoyé via Telegram au chat " + pendingChatId);
}

export function notifyConnected(phoneNumber) {
  if (!bot || !pendingChatId) return;
  bot.sendMessage(
    pendingChatId,
    `✅ *WhatsApp connecté avec succès !*\n\n` +
    `📱 Numéro lié : *${phoneNumber}*\n` +
    `🤖 Le bot est maintenant actif.\n\n` +
    `> 𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣 V2 — En ligne`,
    { parse_mode: "Markdown" }
  );
}

export function notifyDisconnected(reason) {
  if (!bot || !pendingChatId) return;
  bot.sendMessage(
    pendingChatId,
    `❌ *Bot WhatsApp déconnecté*\n\nRaison : ${reason}\n\n_Reconnexion automatique en cours..._`,
    { parse_mode: "Markdown" }
  );
}

export function getTelegramBot() {
  return bot;
}
