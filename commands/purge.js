export const name = "purge";

const msgHistory = new Map();

export function storeMsgKey(jid, key) {
  if (!msgHistory.has(jid)) msgHistory.set(jid, []);
  const list = msgHistory.get(jid);
  list.push(key);
  if (list.length > 100) list.shift();
}

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) {
    return await natsu.sendMessage(jid, { text: "𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Commande de groupe uniquement." }, { quoted: msg });
  }
  const count = Math.min(parseInt(args[0]) || 10, 50);
  const history = msgHistory.get(jid) || [];
  const toDelete = history.slice(-count);

  if (toDelete.length === 0) {
    return await natsu.sendMessage(jid, {
      text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: ⚠️ Aucun message en mémoire à supprimer.\n\n_Note : le bot ne peut supprimer que les messages envoyés depuis son démarrage._`,
    }, { quoted: msg });
  }

  let deleted = 0;
  for (const key of toDelete.reverse()) {
    try {
      await natsu.sendMessage(jid, { delete: key });
      deleted++;
      await new Promise((r) => setTimeout(r, 300));
    } catch {}
  }

  msgHistory.set(jid, history.slice(0, -count));
  await natsu.sendMessage(jid, { text: `𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: ⚜️ ${deleted} message(s) supprimé(s).` }, { quoted: msg });
}
