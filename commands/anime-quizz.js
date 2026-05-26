import { getBareNumber } from "../index.js";

export const name = "anime-quizz";

// Une seule partie par groupe
const activeQuiz = new Map();

// Base de questions (30 questions)
const QUESTIONS = [
  { q: "Quel est le vrai nom de Kira dans Death Note ?", r: "light yagami", alts: ["light"] },
  { q: "Dans quel anime Ichigo Kurosaki est-il le héros ?", r: "bleach" },
  { q: "Comment s'appelle l'attaque signature de Naruto ?", r: "rasengan" },
  { q: "Dans Dragon Ball Z, comment s'appelle la transformation ultime de Goku ?", r: "super saiyan", alts: ["super saïyan", "super-saiyan"] },
  { q: "Dans quel anime trouve-t-on les Titans ?", r: "l'attaque des titans", alts: ["shingeki no kyojin", "attack on titan"] },
  { q: "Quel est le sport pratiqué dans Kuroko no Basket ?", r: "basket", alts: ["basketball"] },
  { q: "Dans One Piece, quel fruit du démon Luffy a-t-il mangé ?", r: "gomu gomu no mi", alts: ["gomu gomu", "hito hito no mi model nika"] },
  { q: "Dans My Hero Academia, comment appelle-t-on les super pouvoirs ?", r: "alter", alts: ["quirk"] },
  { q: "Quel est le nom de la guilde principale dans Fairy Tail ?", r: "fairy tail" },
  { q: "Dans quel anime trouve-t-on le Bankai ?", r: "bleach" },
  { q: "Comment s'appelle le village natal de Naruto ?", r: "konoha", alts: ["village caché des feuilles", "konohagakure"] },
  { q: "Dans Hunter x Hunter, comment s'appelle le système de pouvoirs utilisé ?", r: "nen" },
  { q: "Dans SAO (Sword Art Online), quel est le vrai nom de Kirito ?", r: "kirigaya kazuto", alts: ["kazuto kirigaya", "kirito"] },
  { q: "Combien de Dragon Balls existe-t-il ?", r: "7", alts: ["sept"] },
  { q: "Dans Fullmetal Alchemist, comment s'appellent les deux frères principaux ?", r: "edward et alphonse", alts: ["edward elric et alphonse elric", "elric"] },
  { q: "Dans Tokyo Ghoul, qui est le personnage principal ?", r: "ken kaneki", alts: ["kaneki", "kaneki ken"] },
  { q: "Dans quel anime joue-t-on au volleyball à Karasuno ?", r: "haikyuu", alts: ["haikyu"] },
  { q: "Comment s'appelle l'attaque ultime de Goku dans Dragon Ball ?", r: "kamehameha" },
  { q: "Dans Demon Slayer, quel est le nom du héros principal ?", r: "tanjiro kamado", alts: ["tanjiro"] },
  { q: "Dans Naruto, comment s'appelle le sensei de l'équipe 7 ?", r: "kakashi hatake", alts: ["kakashi"] },
  { q: "Dans One Piece, quel est le rêve de Luffy ?", r: "roi des pirates", alts: ["devenir le roi des pirates"] },
  { q: "Dans quel anime le personnage L est-il un détective légendaire ?", r: "death note" },
  { q: "Comment s'appelle le démon enfermé en Naruto ?", r: "kyubi", alts: ["kurama", "renard à neuf queues"] },
  { q: "Dans Jujutsu Kaisen, comment s'appelle le héros principal ?", r: "yuji itadori", alts: ["itadori"] },
  { q: "Dans Dragon Ball Z, quel est le niveau de Super Saiyan le plus puissant au départ ?", r: "super saiyan 3", alts: ["ssj3"] },
  { q: "Dans Code Geass, quel est le pouvoir de Lelouch ?", r: "geass", alts: ["le geass"] },
  { q: "Dans Black Clover, comment s'appelle l'héros principal ?", r: "asta" },
  { q: "Dans quel anime trouve-t-on des Espadass au service d'Aizen ?", r: "bleach" },
  { q: "Dans Sword Art Online, comment s'appelle le monde virtuel du premier arc ?", r: "aincrad" },
  { q: "Dans Naruto Shippuden, quel est le vrai nom de Tobi ?", r: "obito uchiha", alts: ["obito"] },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
}

function checkAnswer(userAnswer, question) {
  const ua = normalize(userAnswer);
  if (ua === normalize(question.r)) return true;
  if (question.alts) return question.alts.some(a => ua === normalize(a));
  return false;
}

async function runQuiz(natsu, jid, totalQuestions) {
  const selected = shuffle(QUESTIONS).slice(0, totalQuestions);
  const scores = {}; // num -> points
  const quiz = activeQuiz.get(jid);

  await natsu.sendMessage(jid, {
    text: `🎌 *ANIME QUIZZ — ${totalQuestions} questions*\n\n⏱️ 15 secondes par question\n🏆 Le meilleur score gagne !\n\n_La première question arrive dans 3 secondes..._`,
  });

  await new Promise(r => setTimeout(r, 3000));

  for (let i = 0; i < selected.length; i++) {
    if (!activeQuiz.has(jid)) break; // Quiz annulé

    const q = selected[i];
    let answered = false;

    await natsu.sendMessage(jid, {
      text: `❓ *Question ${i + 1}/${totalQuestions}*\n\n${q.q}\n\n_⏳ 15 secondes pour répondre..._`,
    });

    // Listener temporaire pour capter les réponses
    await new Promise((resolve) => {
      let timer;

      const listener = async ({ messages }) => {
        if (answered) return;
        for (const m of messages) {
          if (m.key.remoteJid !== jid) continue;
          if (!m.message || m.key.fromMe) continue;

          const text =
            m.message?.conversation ||
            m.message?.extendedTextMessage?.text || "";
          if (!text || text.startsWith(".")) continue;

          const senderNum = getBareNumber(m.key.participant || m.key.remoteJid);
          const senderJid = m.key.participant || m.key.remoteJid;

          if (checkAnswer(text, q)) {
            answered = true;
            clearTimeout(timer);
            natsu.ev.off("messages.upsert", listener);
            scores[senderNum] = (scores[senderNum] || 0) + 1;
            quiz.scores = scores;
            try {
              await natsu.sendMessage(jid, {
                text: `✅ *Bonne réponse !*\n\n@${senderNum} a trouvé !\nLa réponse était : *${q.r}*\n\n🏆 Score de @${senderNum} : ${scores[senderNum]} pt(s)`,
                mentions: [senderJid],
              });
            } catch {}
            await new Promise(r => setTimeout(r, 2000));
            resolve();
            break;
          }
        }
      };

      natsu.ev.on("messages.upsert", listener);

      timer = setTimeout(async () => {
        if (!answered) {
          natsu.ev.off("messages.upsert", listener);
          try {
            await natsu.sendMessage(jid, {
              text: `⏰ *Temps écoulé !*\nLa réponse était : *${q.r}*`,
            });
          } catch {}
          await new Promise(r => setTimeout(r, 2000));
        }
        resolve();
      }, 15000);
    });
  }

  // Afficher le classement final
  activeQuiz.delete(jid);

  const sortedScores = Object.entries(scores).sort(([, a], [, b]) => b - a);

  if (sortedScores.length === 0) {
    await natsu.sendMessage(jid, {
      text: `🎌 *QUIZZ TERMINÉ !*\nAucun participant n'a répondu correctement. 😅`,
    });
    return;
  }

  const medals = ["🥇", "🥈", "🥉"];
  const classement = sortedScores
    .map(([num, pts], idx) => `${medals[idx] || `${idx + 1}.`} @${num} — *${pts} pt(s)*`)
    .join("\n");

  const mentions = sortedScores.map(([num]) => `${num}@s.whatsapp.net`);

  await natsu.sendMessage(jid, {
    text: `🏆 *CLASSEMENT FINAL — ANIME QUIZZ*\n\n${classement}\n\nMerci d'avoir joué ! 🎌`,
    mentions,
  });
}

export async function execute(natsu, msg, args, from) {
  const jid = from || msg.key.remoteJid;
  if (!jid.endsWith("@g.us")) {
    return natsu.sendMessage(jid, { text: "❌ Cette commande ne fonctionne que dans un groupe." }, { quoted: msg });
  }

  if (activeQuiz.has(jid)) {
    return natsu.sendMessage(jid, { text: "⚠️ Un quizz est déjà en cours dans ce groupe !" }, { quoted: msg });
  }

  // Demander le nombre de questions
  await natsu.sendMessage(jid, {
    text: `🎌 *ANIME QUIZZ*\n\nCombien de questions veux-tu ?\n\n10️⃣ → Envoie *10*\n2️⃣0️⃣ → Envoie *20*\n3️⃣0️⃣ → Envoie *30*\n\n_Tu as 20 secondes pour choisir._`,
  }, { quoted: msg });

  activeQuiz.set(jid, { scores: {}, status: "waiting" });

  // Attendre la réponse du même utilisateur
  const senderNum = getBareNumber(msg.key.participant || msg.key.remoteJid);
  let chosen = null;

  await new Promise((resolve) => {
    const timer = setTimeout(() => {
      natsu.ev.off("messages.upsert", listener);
      resolve();
    }, 20000);

    const listener = async ({ messages }) => {
      for (const m of messages) {
        if (m.key.remoteJid !== jid) continue;
        if (!m.message || m.key.fromMe) continue;
        const mNum = getBareNumber(m.key.participant || m.key.remoteJid);
        if (mNum !== senderNum) continue;
        const text = (m.message?.conversation || m.message?.extendedTextMessage?.text || "").trim();
        if (["10", "20", "30"].includes(text)) {
          chosen = parseInt(text);
          clearTimeout(timer);
          natsu.ev.off("messages.upsert", listener);
          resolve();
          break;
        }
      }
    };

    natsu.ev.on("messages.upsert", listener);
  });

  if (!chosen) {
    activeQuiz.delete(jid);
    return natsu.sendMessage(jid, { text: "❌ Aucun nombre sélectionné. Quizz annulé." });
  }

  await runQuiz(natsu, jid, chosen);
}
