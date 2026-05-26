const fs = require('fs');
const path = require('path');
const { Telegraf, Markup } = require('telegraf');
const { message, callbackQuery } = require('telegraf/filters');
const yts = require('yt-search');
const { ytdl } = require('./allfunc/scrape-ytdl');
const startpairing = require('./pair');
const { jidNormalizedUser, makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");

// ========== CONFIGURATION ==========
// Essaye de charger le token depuis token.js, sinon utilise variable d'environnement
let BOT_TOKEN;
try {
  const tokenModule = require('./token');
  BOT_TOKEN = tokenModule.BOT_TOKEN;
} catch (e) {
  BOT_TOKEN = process.env.BOT_TOKEN;
}
if (!BOT_TOKEN) {
  console.error("❌ BOT_TOKEN manquant. Crée un fichier token.js ou set env BOT_TOKEN");
  process.exit(1);
}

const adminFilePath = './database/admintele.json';
const bannedPath = './richstore/pairing/banned.json';
const ITEMS_PER_PAGE = 10;
const pagedListPairs = {};
const botStartTime = Date.now();
const userStore = './richstore/pairing/users.json';
const premium_file = './premium.json';
let premiumUsers = [];

try {
  if (fs.existsSync(premium_file)) {
    premiumUsers = JSON.parse(fs.readFileSync(premium_file, 'utf-8'));
  } else {
    fs.writeFileSync(premium_file, JSON.stringify([]));
  }
} catch (error) {
  console.error('Failed to load premium users:', error);
}

const userStates = {};

function trackUser(id) {
  if (!fs.existsSync(userStore)) {
    fs.writeFileSync(userStore, JSON.stringify([]));
  }
  const users = JSON.parse(fs.readFileSync(userStore));
  if (!users.includes(id)) {
    users.push(id);
    fs.writeFileSync(userStore, JSON.stringify(users, null, 2));
  }
}

if (!fs.existsSync(adminFilePath)) {
  const defaultAdmin = [String(process.env.OWNER_ID || '8725904884')];
  fs.writeFileSync(adminFilePath, JSON.stringify(defaultAdmin, null, 2));
}

const adminIDs = JSON.parse(fs.readFileSync(adminFilePath, 'utf8'));
const bot = new Telegraf(BOT_TOKEN);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getPushName(ctx) {
  return ctx.from.first_name || ctx.from.username || "User";
}

function formatRuntime(seconds) {
  const pad = (s) => (s < 10 ? '0' + s : s);
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${pad(hrs)}h ${pad(mins)}m ${pad(secs)}s`;
}

function sendListPairPage(ctx, userID, pageIndex) {
  const pairedDevices = pagedListPairs[userID] || [];
  const totalPages = Math.max(1, Math.ceil(pairedDevices.length / ITEMS_PER_PAGE));
  pageIndex = Math.min(Math.max(pageIndex, 0), totalPages - 1);
  const start = pageIndex * ITEMS_PER_PAGE;
  const currentPage = pairedDevices.slice(start, start + ITEMS_PER_PAGE);
  const pageText = currentPage.length
    ? currentPage.map((id, i) => `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣\n\n*${start + i + 1}.* \`ID:\` ${id}`).join('\n⎔')
    : "_No paired devices found._";
  const navButtons = [];
  if (pageIndex > 0) navButtons.push({ text: '⬅️ Back', callback_data: `listpair_page_${pageIndex - 1}` });
  if (pageIndex < totalPages - 1) navButtons.push({ text: '➡️ Next', callback_data: `listpair_page_${pageIndex + 1}` });
  const text = `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣\n\n*Paired Bots (Page ${pageIndex + 1}/${totalPages}):*\n\n⎔${pageText}`;
  ctx.editMessageText(text, {
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: navButtons.length ? [navButtons] : [] }
  }).catch(() => {
    ctx.reply(text, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: navButtons.length ? [navButtons] : [] }
    });
  });
}

function sendDelPairPage(ctx, userID, pageIndex) {
  const pairedDevices = pagedListPairs[userID] || [];
  const totalPages = Math.max(1, Math.ceil(pairedDevices.length / ITEMS_PER_PAGE));
  pageIndex = Math.min(Math.max(pageIndex, 0), totalPages - 1);
  const start = pageIndex * ITEMS_PER_PAGE;
  const currentPage = pairedDevices.slice(start, start + ITEMS_PER_PAGE);
  const keyboard = currentPage.map(id => [
    { text: `🗑️ ${id}`, callback_data: `delpair_${id}` }
  ]);
  const navButtons = [];
  if (pageIndex > 0) navButtons.push({ text: '⬅️ Back', callback_data: `delpair_page_${pageIndex - 1}` });
  if (pageIndex < totalPages - 1) navButtons.push({ text: '➡️ Next', callback_data: `delpair_page_${pageIndex + 1}` });
  if (navButtons.length) keyboard.push(navButtons);
  const text = pairedDevices.length
    ? `Delete Paired Devices (Page ${pageIndex + 1}/${totalPages}):\n\nTap a device ID to delete.`
    : "_No paired devices found._";
  ctx.deleteMessage().catch(() => {});
  ctx.reply(text, {
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: keyboard }
  });
}

// ========== COMMANDES TELEGRAM ==========
bot.command('ping', async (ctx) => {
  const uptime = Math.floor((Date.now() - botStartTime) / 1000);
  ctx.reply(` 𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣 \n*ᴘɪɴɢ*\nʀᴜɴᴛɪᴍᴇ: *${formatRuntime(uptime)}*`, {
    parse_mode: 'Markdown'
  });
});

bot.start((ctx) => {
  const userId = ctx.from.id;
  trackUser(userId);
  ctx.reply('𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣\n\nɪs ᴀᴄᴛɪᴠᴇ ᴀɴᴅ ʀᴜɴɴɪɴɢ ᴡᴇʟʟ🟢', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '𝗦𝗧𝗔𝗥𝗧 𝗕𝗢𝗧', callback_data: 'start_bot' }]
      ]
    }
  });
});

bot.action('start_bot', async (ctx) => {
  const pushname = getPushName(ctx);
  const photoUrl = 'https://gangalink.vercel.app/i/nfp41v55.jpg';
  const captionText = `  
╭━━━━ ⌜𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣⌟
┃❍╭━━━━━━━━━━━━━━━━≽ 👤 ᴜsᴇʀ : ${pushname}
┃❍│👑 ᴅᴇᴠ  : @Varnox_Or_novark 
┃❍│🤖 ʙᴏᴛ ɴᴀᴍᴇ : 𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣
┃❍│⚡ᴠᴇʀsɪᴏɴ : 𝟏.𝟎 
┃❍│♻️ sᴛᴀᴛᴜs :
┗━━━
┏━━━━⪨⌜BOT INFO⌟⪩━━▣
┃✪┃ /connect
┃✪┃ /delpair
┃✪┃ /xreport
┃✪┃ /deluser
┃✪┃ /listpair
┃✪┃ /broadcast
╰━━━━━━━━━━━━━━━━≽
 ©2026 ɳσʋαɾƙ xᴅ ʋ1 Ⴆყ ʋαɾɳσx
`;
  const buttons = Markup.inlineKeyboard([
    [Markup.button.url('👤 ɢʀᴏᴜᴘ', 'https://t.me/varnox_official'), Markup.button.url('🔔 ᴄʜᴀɴɴᴇʟ', 'https://t.me/varnoxprimeech')]
  ]);
  try {
    await ctx.sendChatAction('upload_photo');
    await ctx.replyWithPhoto(photoUrl, { caption: captionText, parse_mode: 'HTML', ...buttons });
  } catch (err) {
    console.error('Image failed to load, sending fallback text:', err);
    await ctx.reply(captionText, { parse_mode: 'HTML', ...buttons });
  }
});

bot.command('connect', async (ctx) => {
  const userId = ctx.from.id;
  const channelUsernames = ['@varnox_official','@varnoxprimeech','@devhive_canalchat','@novarkxdch'];
  let joinedAllChannels = true;
  for (const channel of channelUsernames) {
    try {
      const member = await ctx.telegram.getChatMember(channel, userId);
      if (['left', 'kicked'].includes(member.status)) {
        joinedAllChannels = false;
        break;
      }
    } catch (e) {
      joinedAllChannels = false;
      break;
    }
  }
  if (!joinedAllChannels) {
    return ctx.reply(
      `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣 \n\nᴅᴏ ᴛʜᴇ ғᴏʟʟᴏᴡɪɴɢ\nᴊᴏɪɴ ᴀʟʟ ᴘʀᴏᴘᴏsᴀʟ\n ɪғ ᴅᴏɴᴇ ᴘʀᴇss "ᴊᴏɪɴᴇᴅ"\n👑𝙳𝙴𝚅: @Varnox_Or_novark`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📢ᴄʜᴀɴɴᴇʟ', url: 'https://t.me/varnox_official'}],
            [{ text: '👤ɢʀᴏᴜᴘ', url: 'https://t.me/varnox_Gc'}],
            [{ text: '📢ᴄʜᴀɴɴᴇʟ', url: 'https://t.me/varnoxprimeech'}],
            [{ text: '📢ᴄʜᴀɴɴᴇʟ', url: 'https://t.me/novarkxdch' }],
            [{ text: '📢ᴄʜᴀɴɴᴇʟ', url: 'https://t.me/devhive_canalchat'}],
            [{ text: '𝗖𝗛𝗘𝗖𝗞 𝗝𝗢𝗜𝗡', callback_data: 'check_join' }]
          ]
        }
      }
    );
  }
  const text = ctx.message.text.split(' ')[1];
  if (!text) {
    return ctx.reply('𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣 \n\n ʜᴏᴡ ᴛᴏ ᴄᴏɴɴᴇᴄᴛ\n ᴇɴᴛᴇʀ ʏᴏᴜʀ ɴᴜᴍ ᴜsɪɴɢ ᴛʜᴇ ғᴏʀᴍᴀᴛ ʙᴇʟᴏᴡ\n ᴇxᴀᴍᴘʟᴇ: /connect 224xxxxx', { parse_mode: 'Markdown' });
  }
  if (/[a-z]/i.test(text)) {
    return ctx.reply('Please enter a valid phone number.');
  }
  if (!/^\d{7,15}(\|\d{1,10})?$/.test(text)) {
    return ctx.reply('Enter number in this format: 224xxxx(numbers only, no symbols or letters❌)', { parse_mode: 'Markdown' });
  }
  if (text.startsWith('0')) {
    return ctx.reply('Please use a different number format.');
  }
  const target = text.split("|")[0];
  const Xreturn = target.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  const countryCode = text.slice(0, 3);
  const prefixxx = text.slice(0, 1);
  if (["252", "229", "92", "0"].includes(countryCode) || prefixxx === "0") {
    return ctx.reply("🚫Sorry, numbers with this country code are not supported.");
  }
  const pairingFolder = './richstore/pairing';
  const pairedUsersFromJson = fs.readdirSync(pairingFolder).filter(file => file.endsWith('@s.whatsapp.net')).length;
  if (pairedUsersFromJson >= 70) {
    return ctx.reply(`*Pairing not more available contact owner to create another server*`);
  }
  await startpairing(Xreturn);
  await sleep(4000);
  const cu = fs.readFileSync('./richstore/pairing/pairing.json', 'utf-8');
  const cuObj = JSON.parse(cu);
  ctx.reply(
    ` 
╭━━━ ⌜𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣⌟ 
┃❍╭━━━━━━━━━━━━━≽
┃ ➥ ʏᴏᴜʀ ᴘᴀɪʀɪɴɢ 
┃❍│ᴘᴀɪʀ ɴᴜᴍ: \`${target}\`
┃❍│ᴘᴀɪʀ ᴄᴏᴅᴇ: \`${cuObj.code}\`
╰━━━━━━━━━━━━━━━━≽
 ©2026 ɳσʋαɾƙ xᴅ ʋ1 Ⴆყ ʋαɾɳσx
`,
    {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔔ᴄʜᴀɴɴᴇʟ', url: 'https://t.me/varnox_official'}]
        ]
      }
    }
  );
});

bot.action('check_join', async (ctx) => {
  const channelUsernames = ['@varnox_official','@varnoxprimeech','@novarkxdch','@devhive_canalchat'];
  const userId = ctx.from.id;
  let joinedAllChannels = true;
  for (const channel of channelUsernames) {
    try {
      const member = await ctx.telegram.getChatMember(channel, userId);
      if (['left', 'kicked'].includes(member.status)) {
        joinedAllChannels = false;
        break;
      }
    } catch (e) {
      joinedAllChannels = false;
      break;
    }
  }
  if (joinedAllChannels) {
    ctx.reply('You have successfully joined all requests.');
  } else {
    ctx.answerCbQuery('You haven’t joined yet pls do.', { show_alert: true });
  }
});

bot.command('listpair', async (ctx) => {
  const userID = ctx.from.id.toString();
  if (!adminIDs.includes(userID)) return ctx.reply('Unauthorized access.🚫');
  const pairingPath = './richstore/pairing';
  if (!fs.existsSync(pairingPath)) return ctx.reply('No paired devices found.');
  const entries = fs.readdirSync(pairingPath, { withFileTypes: true });
  const pairedDevices = entries.filter(entry => entry.isDirectory()).map(entry => entry.name);
  if (pairedDevices.length === 0) return ctx.reply('No paired devices found.');
  pagedListPairs[userID] = pairedDevices;
  sendListPairPage(ctx, userID, 0);
});

bot.command('deluser', async (ctx) => {
  const userID = ctx.from.id.toString();
  if (!adminIDs.includes(userID)) return ctx.reply('Unauthorized access🚫.');
  const pairingPath = './richstore/pairing';
  if (!fs.existsSync(pairingPath)) return ctx.reply('No paired devices found.');
  const entries = fs.readdirSync(pairingPath, { withFileTypes: true });
  const pairedDevices = entries.filter(entry => entry.isDirectory()).map(entry => entry.name);
  if (pairedDevices.length === 0) return ctx.reply('No paired devices found.');
  pagedListPairs[userID] = pairedDevices;
  sendDelPairPage(ctx, userID, 0);
});

bot.command('broadcast', async (ctx) => {
  const senderId = ctx.from.id;
  const message = ctx.message.text.split(' ').slice(1).join(' ');
  if (!adminIDs.includes(senderId.toString())) {
    return ctx.reply('access blocked only my owner ʋαɾɳσx can use this command🚫.');
  }
  if (!message) {
    return ctx.reply('𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣 \n\n Please provide a message to broadcast.\n Usage: /broadcast Hello users!');
  }
  const users = JSON.parse(fs.readFileSync('./richstore/pairing/users.json'));
  let success = 0, failed = 0;
  for (const userId of users) {
    try {
      await ctx.telegram.sendMessage(userId, `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣 \n\nᴍsɢ:${message}`, { parse_mode: 'Markdown' });
      success++;
    } catch { failed++; }
  }
  ctx.reply(`Broadcast complete.\n\nSuccess: ${success}\nFailed: ${failed}`);
});

bot.command('xreport', async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  if (args.length === 0) return ctx.reply('𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣 \n\n Usage: /xreport 224xxxx');
  const targetNumber = args[0].replace(/\D/g, '');
  if (!targetNumber) return ctx.reply('Invalid number. Use digits only.');
  const targetJid = jidNormalizedUser(`${targetNumber}@s.whatsapp.net`);
  const pairingPath = './richstore/pairing';
  if (!fs.existsSync(pairingPath)) return ctx.reply('No active paired devices found.');
  const sessions = fs.readdirSync(pairingPath, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => path.join(pairingPath, entry.name));
  if (sessions.length === 0) return ctx.reply('No active WhatsApp sessions to perform report.');
  ctx.reply(`𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣 \n\n 🚨 Starting *mass-report* on +${targetNumber} using ${sessions.length} paired bots...`, { parse_mode: 'Markdown' });
  for (const sessionPath of sessions) {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
      const rich = makeWASocket({ auth: state });
      rich.ev.on('creds.update', saveCreds);
      for (let i = 0; i < 30; i++) {
        try {
          await rich.ws.sendNode({
            tag: 'iq',
            attrs: { to: 's.whatsapp.net', type: 'set', xmlns: 'w:report' },
            content: [{ tag: 'report', attrs: { to: targetJid, type: 'spam', id: rich.generateMessageTag() }, content: [] }]
          });
          console.log(`✅ Report ${i + 1} sent from ${path.basename(sessionPath)}`);
          await sleep(2000);
        } catch (err) {
          console.error(`❌ Report attempt ${i + 1} failed:`, err.message);
        }
      }
    } catch (err) {
      console.error(`❌ Session error:`, err.message);
    }
  }
  ctx.reply(`𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣 \n\n✅ Finished sending reports on *${targetNumber}*`, { parse_mode: 'Markdown' });
});

bot.command('delpair', async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  if (args.length === 0) return ctx.reply('𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣 \n\nᴜsᴇ ғᴏʀᴍᴀᴛ ʙᴇʟᴏᴡ\n ᴜsᴀɢᴇ: /delpair 224xxxx', { parse_mode: 'Markdown' });
  const inputNumber = args[0].replace(/\D/g, '');
  const jidSuffix = `${inputNumber}@s.whatsapp.net`;
  const pairingPath = './richstore/pairing';
  if (!fs.existsSync(pairingPath)) return ctx.reply('No paired devices found.');
  const entries = fs.readdirSync(pairingPath, { withFileTypes: true });
  const matched = entries.find(entry => entry.isDirectory() && entry.name.endsWith(jidSuffix));
  if (!matched) return ctx.reply(`No paired device found for number ${inputNumber}`);
  const targetPath = `${pairingPath}/${matched.name}`;
  fs.rmSync(targetPath, { recursive: true, force: true });
  ctx.reply(`╭━━ ⌜𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣⌟\n┃❍╭━━━━━━━━━━━━━━≽\n┃❍┃ ᴇɴᴅɪɴɢ ᴘᴀɪʀɪɴɢ\n┃❍┃ ɴᴜᴍ ᴘᴀɪʀ: \`${inputNumber}\`\n┃❍┃ ɪᴅ: \`${matched.name}\`\n╰━━━━━━━━━━━━━━━━≽`, { parse_mode: 'Markdown' });
});

bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  if (userStates[userId] === 'waiting_for_song') {
    const text = ctx.message.text;
    try {
      ctx.reply('looking for...');
      const search = await yts(text);
      const telaso = search.all[0].url;
      const response = await ytdl(telaso);
      const puki = response.data.mp3;
      await ctx.replyWithAudio({ url: puki }, {
        caption: `Title: ${search.all[0].title}\nDuration: ${search.all[0].timestamp}`,
      });
      ctx.reply('🔓 Selesai!');
    } catch (error) {
      console.error(error);
      ctx.reply('An error occurred while downloading the song, please try again later.');
    }
    delete userStates[userId];
  }
});

// ========== FONCTIONS EXPORTÉES POUR index.js ==========
let pairingResolve = null;

function initTelegramBot() {
  console.log("🤖 Initialisation du bot Telegram...");
  bot.launch()
    .then(() => console.log('✅ Bot Telegram actif'))
    .catch(err => console.error('❌ Erreur lancement Telegram:', err));
}

function waitForPhoneNumber() {
  return new Promise((resolve) => {
    pairingResolve = resolve;
    console.log("📱 En attente d'un numéro via Telegram...");
  });
}

function sendPairingCode(code) {
  if (!pairingResolve) return;
  // On envoie le code à l'utilisateur qui a demandé le pairing
  // Ici on pourrait l'envoyer à un chat spécifique. On utilise simplement la résolution.
  console.log(`🔑 Code de pairing reçu: ${code}`);
  // On pourrait aussi l'envoyer sur Telegram à l'admin
  pairingResolve(code);
  pairingResolve = null;
}

function notifyConnected(jid) {
  console.log(`🔌 Bot WhatsApp connecté: ${jid}`);
  // Optionnel : envoyer un message sur Telegram
}

function notifyDisconnected(reason) {
  console.log(`⚠️ Bot WhatsApp déconnecté: ${reason}`);
}

module.exports = {
  initTelegramBot,
  waitForPhoneNumber,
  sendPairingCode,
  notifyConnected,
  notifyDisconnected,
  bot // si jamais tu veux l'utiliser ailleurs
};