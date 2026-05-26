export const name = "inception";

// Commandes de niveau 2 aléatoires (simples, sans args requis)
const LEVEL2_COMMANDS = ["ping", "infos", "sticker", "admins", "count", "protect"];

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;

  if (args.length === 0) {
    return natsu.sendMessage(jid, {
      text: "❌ Usage : `.inception .commande [arguments]`\nExemple : `.inception .ping`",
    }, { quoted: msg });
  }

  // Extraire la commande de niveau 1
  const PREFIX = global.PREFIX || ".";
  const rawCmd = args[0].startsWith(PREFIX) ? args[0].slice(PREFIX.length) : args[0];
  const cmd1Name = rawCmd.toLowerCase();
  const cmd1Args = args.slice(1);

  const commands = global.commands || {};
  const cmd1 = commands[cmd1Name];

  // Choisir une commande aléatoire de niveau 2 (différente de la première)
  const pool = LEVEL2_COMMANDS.filter(c => c !== cmd1Name && commands[c]);
  const cmd2Name = pool[Math.floor(Math.random() * pool.length)];
  const cmd2 = commands[cmd2Name];

  await natsu.sendMessage(jid, {
    text: `🌀 *INCEPTION — Niveau 1 :* \`.${cmd1Name}\`\n🌀 *Niveau 2 :* \`.${cmd2Name}\`\n\n_Exécution en cours..._`,
  }, { quoted: msg });

  // Exécuter niveau 1
  if (cmd1 && typeof cmd1.execute === "function") {
    try {
      await natsu.sendMessage(jid, { text: `▶️ *Commande de niveau 1 :* \`.${cmd1Name}\`` });
      await cmd1.execute(natsu, msg, cmd1Args, from);
    } catch (e) {
      await natsu.sendMessage(jid, { text: `⚠️ Niveau 1 échoué : ${e?.message}` });
    }
  } else {
    await natsu.sendMessage(jid, { text: `❌ Commande inconnue : \`.${cmd1Name}\`` });
  }

  // Pause entre les deux exécutions
  await new Promise(r => setTimeout(r, 1500));

  // Exécuter niveau 2
  if (cmd2 && typeof cmd2.execute === "function") {
    try {
      await natsu.sendMessage(jid, { text: `▶️ *Commande de niveau 2 (aléatoire) :* \`.${cmd2Name}\`` });
      await cmd2.execute(natsu, msg, [], from);
    } catch (e) {
      await natsu.sendMessage(jid, { text: `⚠️ Niveau 2 échoué : ${e?.message}` });
    }
  } else {
    await natsu.sendMessage(jid, { text: `❌ Aucune commande de niveau 2 disponible.` });
  }
}
