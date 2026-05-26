export const name = "owner";

const OWNERS = [
  { name: "𝛁𝚫𝚪𝚴𝚯𝚾 — VARNOX", number: "224669288332" },
  { name: "𝛁𝚫𝚪𝚴𝚯𝚾 — PRIMEE", number: "224610835573" },
];

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  try {
    for (const owner of OWNERS) {
      const vcard =
        `BEGIN:VCARD\n` +
        `VERSION:3.0\n` +
        `FN:${owner.name}\n` +
        `ORG:𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣 DEV;\n` +
        `TEL;type=CELL;type=VOICE;waid=${owner.number}:+${owner.number}\n` +
        `END:VCARD`;
      await natsu.sendMessage(jid, {
        contacts: {
          displayName: owner.name,
          contacts: [{ vcard }],
        },
      }, { quoted: msg });
    }
  } catch (e) {
    await natsu.sendMessage(jid, { text: "> ❌ 𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣: Impossible d'afficher le owner." }, { quoted: msg });
  }
}
