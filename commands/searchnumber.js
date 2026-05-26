export const name = "searchnumber";

// Extraction robuste du numéro depuis un JID WhatsApp
// Gère les formats : 224XXX@s.whatsapp.net, 224XXX:0@s.whatsapp.net, @lid
function extractPhone(jid) {
  if (!jid) return null;
  const str = String(jid);
  // Les JIDs @lid sont des identifiants internes sans numéro de téléphone
  if (str.endsWith("@lid")) return null;
  const bare = str.split("@")[0].split(":")[0];
  const digits = bare.replace(/[^0-9]/g, "");
  return digits.length >= 7 ? digits : null;
}

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;

  if (!jid.endsWith("@g.us")) {
    return natsu.sendMessage(jid, {
      text: "❌ Cette commande ne fonctionne que dans un groupe.",
    }, { quoted: msg });
  }

  const rawIndicatif = (args[0] || "").replace(/[^0-9]/g, "");
  if (!rawIndicatif) {
    return natsu.sendMessage(jid, {
      text: "❌ Usage : `.searchnumber indicatif`\nExemple : `.searchnumber 224` (Guinée)\nExemple : `.searchnumber 225` (Côte d'Ivoire)\nExemple : `.searchnumber 33` (France)",
    }, { quoted: msg });
  }

  let meta;
  try {
    meta = await natsu.groupMetadata(jid);
  } catch (e) {
    return natsu.sendMessage(jid, {
      text: "❌ Impossible de récupérer les membres du groupe.\n_Vérifie que le bot est admin._",
    }, { quoted: msg });
  }

  const total = meta.participants.length;
  const matches = [];

  for (const p of meta.participants) {
    const num = extractPhone(p.id);
    if (!num) continue; // JID @lid ou invalide, on saute
    if (num.startsWith(rawIndicatif)) {
      matches.push({ jid: p.id, num, admin: p.admin });
    }
  }

  if (matches.length === 0) {
    return natsu.sendMessage(jid, {
      text: `🔍 Aucun numéro avec l'indicatif *+${rawIndicatif}* parmi les *${total}* membres de ce groupe.`,
    }, { quoted: msg });
  }

  const mentionJids = matches.map(p => p.jid);

  // Découper en blocs de 50 mentions max pour éviter les limites WhatsApp
  const CHUNK = 50;
  for (let i = 0; i < matches.length; i += CHUNK) {
    const chunk = matches.slice(i, i + CHUNK);
    const lignes = chunk.map((p, idx) => {
      const role = p.admin === "superadmin" ? " 👑" : p.admin === "admin" ? " ⭐" : "";
      return `${i + idx + 1}. @${p.num}${role}`;
    });

    const header = i === 0
      ? `🔍 *Membres avec l'indicatif +${rawIndicatif}* — *${matches.length}* trouvé(s) sur ${total} :\n\n`
      : `🔍 *(Suite)*\n\n`;

    await natsu.sendMessage(jid, {
      text: header + lignes.join("\n"),
      mentions: chunk.map(p => p.jid),
    }, { quoted: i === 0 ? msg : undefined });

    if (i + CHUNK < matches.length) {
      await new Promise(r => setTimeout(r, 800));
    }
  }
}
