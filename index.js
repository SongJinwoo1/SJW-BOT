const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const pino = require("pino");
const express = require("express");
const app = express();

// --- سيرفر لمنع السيرفر من النوم (للمجاني) ---
app.get("/", (req, res) => res.send("نظام 𝑺𝒐𝒏𝒈 𝑱𝒊𝒏 𝑾𝒐𝒐 مستيقظ الآن!"));
app.listen(process.env.PORT || 3000, () => console.log("سيرفر الاستيقاظ جاهز"));

async function startSJW() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        browser: ["SJW-SYSTEM", "Chrome", "1.0.0"]
    });

    // --- الربط برقمك الخاص ---
    if (!sock.authState.creds.registered) {
        const phoneNumber = "965997805334"; // رقمك الرسمي المسجل [cite: 2026-02-21]
        setTimeout(async () => {
            let code = await sock.requestPairingCode(phoneNumber);
            console.log(`\n\n=== كود ربط الواتساب الخاص بك هو: ${code} ===\n\n`);
        }, 3000);
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection } = update;
        if (connection === "close") startSJW();
        else if (connection === "open") console.log("تـم الاسـتـيـقـاظ.. نـظـام ســونـــغ جـيـن وو مـتـصـل!");
    });

    // --- نظام الأوامر والرد بصورتك المعتمدة ---
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

        if (text === "اوامر" || text === "أوامر") {
            const imageURL = "https://raw.githubusercontent.com/SongJinwoo1/BOT-SONG-JIN-WOOO/main/IMG_4511.jpeg"; // صورتك المعتمدة [cite: 2026-02-21]
            
            await sock.sendMessage(from, { 
                image: { url: imageURL }, 
                caption: `『 🜲 ╎ **𝑺𝑶𝑵𝑮 𝑱𝑰𝑵 𝑾𝑶𝑶 𝑩𝑶𝑻** ╎ 🜲 』\n\nمرحباً بك في نظام التطوير.\n\n✭ الأوامر متوفرة في الموقع:\nhttps://songjinwoo1.github.io/BOT-SONG-JIN-WOOO/\n\n"أنا أتطور.. فلا تضيع وقت الحاكم"` 
            });
        }
    });
}

startSJW();
