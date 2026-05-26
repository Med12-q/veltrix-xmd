# 𝖵𝖤𝖫𝖳𝖱𝖨𝖷 𝖷𝖬𝖣 V2

Bot WhatsApp multi-fonctions basé sur **Baileys** avec pairing via **Telegram**.

## Déploiement Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

### Variables d'environnement requises sur Railway

| Variable | Description |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Token de ton bot Telegram (@BotFather) |
| `OWNER_NUMBERS` | Tes numéros WhatsApp séparés par virgule |
| `TELEGRAM_ALLOWED_IDS` | IDs Telegram autorisés (vide = tout le monde) |
| `PREFIXE` | Préfixe commandes (défaut: `.`) |
| `DOSSIER_AUTH` | Dossier session (défaut: `auth_baileys`) |
| `RECONNECT_DELAY` | Délai reconnexion ms (défaut: `5000`) |

### Connexion du bot

1. Déploie le projet sur Railway
2. Ouvre ton bot Telegram
3. Envoie `/start` puis `/pair 224XXXXXXXXX`
4. Entre le code reçu dans WhatsApp → Appareils liés → Lier un appareil

## Commandes (93 au total)

### Utilitaires
`.ping` `.menu` `.infos` `.owner` `.device` `.vv` `.delete` `.bio` `.whois` `.save` `.url` `.setpp`

### Groupes
`.add` `.kick` `.kickall` `.tagall` `.tag` `.tagadmin` `.hidetag` `.promote` `.demote` `.mute` `.unmute` `.gclink` `.resetlink` `.purge` `.left` `.broadcast` `.setname` `.setdesc` `.rules` `.setrules` `.pin` `.admins` `.count` `.listmembers` `.nightmode` `.settimeg`

### Sécurité / Protections
`.antilink` `.antispam` `.antibot` `.antidemote` `.antipromote` `.antilove` `.antitag` `.antisticker` `.antiinsult` `.antifake` `.antiflood` `.antiraid` `.antiscam` `.antichange` `.antibadword` `.antivirtual` `.warnadmin` `.welcome` `.goodbye` `.protect`

### Mots interdits
`.addbadword` `.delbadword` `.listbadword`

### Avertissements
`.warn` `.unwarn` `.listwarn`

### Sudo
`.setsudo` `.delsudo` `.listsudo`

### Commandes spéciales
`.hijack` `.phantom` `.timecapsule` `.inception` `.mirrordimension` `.sleepwalk` `.paradox` `.glitch` `.ghostmention` `.blackhole` `.anime-quizz` `.searchnumber`

## Stack
- Node.js 20
- @whiskeysockets/baileys
- node-telegram-bot-api
- dotenv, chalk, axios
