import { BOT_NAME, BOT_VERSION, BOT_DEV, BOT_IMAGE, MENU_AUDIO } from "../index.js";

const NEWSLETTER_JID = "120363408517150835@newsletter";

export const name = "menu";

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;

  const uptime = process.uptime();
  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);
  const s = Math.floor(uptime % 60);
  const uptimeStr = `${h}h ${m}m ${s}s`;

  const caption =
`╭━━━ 〔 ${BOT_NAME} V${BOT_VERSION} 〕
┃✪╭━━━━━━━━━━━━━━━━≽
┃✪│🥷🏾 *USER*    : ${msg.pushName || "Invité"}
┃✪│⚙️ *MODE*     : 🔒 Privé
┃✪│⏱️ *UPTIME*   : ${uptimeStr}
┃✪│📱 *VERSION*  : ${BOT_VERSION}
┃✪│🧎🏾 *DEV*    : _${BOT_DEV}_
╰━━━━━━━━━━━━━━━━≽

➥ ❐ ⌜♻️ UTILITAIRES ⌟
┃✪│❍ ping
┃✪│❍ infos
┃✪│❍ owner
┃✪│❍ device
┃✪│❍ whois @
┃✪│❍ bio @
┃✪│❍ vv
┃✪│❍ delete
┃✪│❍ autorecording
┃✪│❍ setpp
┃✪│❍ save
┃✪│❍ url
╰━━━━━━━━━━━━━━━━≽

➥ ❐ ⌜👥 GROUPES ⌟
┃✪│❍ add 224xxx
┃✪│❍ kick @
┃✪│❍ kickall @
┃✪│❍ tagall
┃✪│❍ tag
┃✪│❍ tagadmin
┃✪│❍ hidetag
┃✪│❍ everyone
┃✪│❍ promote @
┃✪│❍ demote @
┃✪│❍ promoteall
┃✪│❍ demoteall
┃✪│❍ gclink
┃✪│❍ resetlink
┃✪│❍ infosgroups
┃✪│❍ count
┃✪│❍ listonline
┃✪│❍ listmembers
┃✪│❍ admins
┃✪│❍ mute
┃✪│❍ unmute
┃✪│❍ mute-time
┃✪│❍ nightmode on/off
┃✪│❍ settimeg open/close
┃✪│❍ writetoall
┃✪│❍ broadcast
┃✪│❍ purge [n]
┃✪│❍ left
┃✪│❍ principal
┃✪│❍ setppg
┃✪│❍ setname
┃✪│❍ setdesc
┃✪│❍ rules
┃✪│❍ setrules
┃✪│❍ pin
╰━━━━━━━━━━━━━━━━≽

➥ ❐ ⌜⚠️ AVERTISSEMENTS ⌟
┃✪│❍ warn @
┃✪│❍ unwarn @
┃✪│❍ listwarn
╰━━━━━━━━━━━━━━━━≽

➥ ❐ ⌜🔷 SUDO ⌟
┃✪│❍ setsudo
┃✪│❍ delsudo
┃✪│❍ listsudo
╰━━━━━━━━━━━━━━━━≽

➥ ❐ ⌜🛡️ SÉCURITÉ ⌟
┃✪│❍ antilink
┃✪│❍ antispam
┃✪│❍ antibot
┃✪│❍ antidemote
┃✪│❍ antipromote
┃✪│❍ antilove
┃✪│❍ antitag
┃✪│❍ antisticker
┃✪│❍ antiinsult
┃✪│❍ antifake
┃✪│❍ antiflood
┃✪│❍ antiscam
┃✪│❍ antichange
┃✪│❍ antibadword
┃✪│❍ antivirtual
┃✪│❍ antiraid
┃✪│❍ warnadmin
┃✪│❍ welcome
┃✪│❍ goodbye
┃✪│❍ addbadword
┃✪│❍ delbadword
┃✪│❍ listbadword
┃✪│❍ protect
╰━━━━━━━━━━━━━━━━≽

➥ ❐ ⌜🎬 MÉDIAS ⌟
┃✪│❍ sticker
┃✪│❍ photo
┃✪│❍ save
╰━━━━━━━━━━━━━━━━≽

➥ ❐ ⌜💎 FUN ⌟
┃✪│❍ wasted @
╰━━━━━━━━━━━━━━━━≽

> ©2026 ${BOT_NAME} — Dev by _${BOT_DEV}_`;

  const newsletterCtx = {
    contextInfo: {
      isForwarded: false,
      forwardedNewsletterMessageInfo: {
        newsletterJid: NEWSLETTER_JID,
        newsletterName: BOT_NAME,
        serverMessageId: -1,
      },
    },
  };

  try {
    await natsu.sendMessage(jid, {
      image: { url: BOT_IMAGE },
      caption,
      ...newsletterCtx,
    }, { quoted: msg });
  } catch {
    try {
      await natsu.sendMessage(jid, {
        text: caption,
        ...newsletterCtx,
      }, { quoted: msg });
    } catch {}
  }

  try {
    await natsu.sendMessage(jid, { audio: { url: MENU_AUDIO }, mimetype: "audio/mpeg" }, { quoted: msg });
  } catch {}
}
