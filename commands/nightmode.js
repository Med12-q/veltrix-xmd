import fs from "fs";

export const name = "nightmode";

const NIGHTMODE_FILE = "./nightmode.json";
const timers = {};

function loadConfig() {
  if (!fs.existsSync(NIGHTMODE_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(NIGHTMODE_FILE, "utf-8")); } catch { return {}; }
}
function saveConfig(data) { fs.writeFileSync(NIGHTMODE_FILE, JSON.stringify(data, null, 2)); }

function parseHHMM(str) {
  const [h, m] = (str || "").split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return { h, m };
}

function msUntil(h, m) {
  const now = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return target - now;
}

export function startNightmodeTimers(natsu) {
  const config = loadConfig();
  for (const [jid, cfg] of Object.entries(config)) {
    if (!cfg.enabled) continue;
    scheduleNightmode(natsu, jid, cfg.closeH, cfg.closeM, cfg.openH, cfg.openM);
  }
}

function scheduleNightmode(natsu, jid, closeH, closeM, openH, openM) {
  if (timers[jid]) {
    clearTimeout(timers[jid].close);
    clearTimeout(timers[jid].open);
  }

  const closeIn = msUntil(closeH, closeM);
  const openIn = msUntil(openH, openM);

  timers[jid] = {
    close: setTimeout(async () => {
      try {
        await natsu.groupSettingUpdate(jid, "announcement");
        await natsu.sendMessage(jid, {
          text: `╭═══🌙 NIGHT MODE 𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣 🌙═══╮\n│ 🔇 Groupe fermé pour la nuit.\n│ ⏰ Réouverture à ${String(openH).padStart(2,"0")}:${String(openM).padStart(2,"0")}\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━≽`,
        });
      } catch {}
      scheduleNightmode(natsu, jid, closeH, closeM, openH, openM);
    }, closeIn),
    open: setTimeout(async () => {
      try {
        await natsu.groupSettingUpdate(jid, "not_announcement");
        await natsu.sendMessage(jid, {
          text: `╭═══☀️ MORNING MODE 𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣 ☀️═══╮\n│ 🔊 Groupe rouvert. Bonne journée !\n│ ⏰ Fermeture ce soir à ${String(closeH).padStart(2,"0")}:${String(closeM).padStart(2,"0")}\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━≽`,
        });
      } catch {}
    }, openIn),
  };
}

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) {
    return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Commande de groupe uniquement." }, { quoted: msg });
  }

  if (!args[0]) {
    const config = loadConfig();
    const cfg = config[jid];
    return await natsu.sendMessage(jid, {
      text:
        `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: 🌙 Night Mode ${cfg?.enabled ? "actif ✅" : "inactif ❌"}\n` +
        (cfg ? `⏰ Fermeture: ${String(cfg.closeH).padStart(2,"0")}:${String(cfg.closeM).padStart(2,"0")} | Ouverture: ${String(cfg.openH).padStart(2,"0")}:${String(cfg.openM).padStart(2,"0")}\n` : "") +
        `\nUsage :\n.nightmode on 22:00 06:00 — activer (ferme à 22h, ouvre à 6h)\n.nightmode off — désactiver`,
    }, { quoted: msg });
  }

  if (args[0] === "off") {
    const config = loadConfig();
    if (config[jid]) { config[jid].enabled = false; saveConfig(config); }
    if (timers[jid]) { clearTimeout(timers[jid].close); clearTimeout(timers[jid].open); delete timers[jid]; }
    return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: 🌙 Night Mode désactivé ❌" }, { quoted: msg });
  }

  if (args[0] === "on") {
    const closeTime = parseHHMM(args[1]);
    const openTime = parseHHMM(args[2]);
    if (!closeTime || !openTime) {
      return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Usage : .nightmode on HH:MM HH:MM (ex: .nightmode on 22:00 06:00)" }, { quoted: msg });
    }
    const config = loadConfig();
    config[jid] = { enabled: true, closeH: closeTime.h, closeM: closeTime.m, openH: openTime.h, openM: openTime.m };
    saveConfig(config);
    scheduleNightmode(natsu, jid, closeTime.h, closeTime.m, openTime.h, openTime.m);
    await natsu.sendMessage(jid, {
      text:
        `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: 🌙 Night Mode activé ✅\n` +
        `🔇 Fermeture à ${args[1]}\n` +
        `🔊 Ouverture à ${args[2]}`,
    }, { quoted: msg });
  }
}
