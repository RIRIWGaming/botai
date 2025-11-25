import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from "@whiskeysockets/baileys";

import fs from "fs";
import pino from "pino";
import qrcode from "qrcode";

import { loadCommands } from "./lib/utils.js";
import * as ai from "./lib/ai.js";
import * as sticker from "./lib/sticker.js";
import * as dl from "./lib/download.js";
import * as tools from "./lib/tools.js";

// GANTI DENGAN NOMOR KAMU 
// Format WA JID: 628xxxxxx@s.whatsapp.net
const ownerNumber = "62895339344449@s.whatsapp.net";

const config = JSON.parse(fs.readFileSync('./config.json'));

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    printQRInTerminal: false, // kita tidak pakai terminal QR
    logger: pino({ level: 'silent' }),
    auth: state
  });

  sock.ev.on('creds.update', saveCreds);

  // Load commands folder
  const commands = await loadCommands('./commands');

  // =============== HANDLE MESSAGE ===============
  sock.ev.on('messages.upsert', async ({ messages }) => {
    try {
      const m = messages[0];
      if (!m.message) return;

      const from = m.key.remoteJid;

      let text =
        m.message.conversation ||
        m.message.extendedTextMessage?.text ||
        '';

      const prefix = config.prefix || '!';

      // ===== AI Auto Reply (private chat only)
      if (text && !text.startsWith(prefix)) {
        if (!from.endsWith('@g.us')) {
          const reply = await ai.aiChat(text).catch(() => null);
          if (reply) {
            await sock.sendMessage(from, { text: reply });
            return;
          }
        }
      }

      // Command tidak pakai prefix
      if (!text.startsWith(prefix)) return;

      const withoutPrefix = text.slice(prefix.length).trim();
      const [cmdName, ...args] = withoutPrefix.split(/\s+/);

      const cmd = commands[cmdName];
      if (!cmd) {
        await sock.sendMessage(from, { text: 'Perintah tidak ditemukan. Ketik !menu' });
        return;
      }

      await cmd.handler({
        sock,
        message: m,
        args,
        from,
        config,
        utils: { sticker, dl, tools }
      });

    } catch (err) {
      console.error(err);
    }
  });

  // =============== WELCOME / GOODBYE ===============
  sock.ev.on('group-participants.update', async (update) => {
    try {
      const gid = update.id;
      const action = update.action;

      for (const p of update.participants) {
        if (action === 'add') {
          await sock.sendMessage(gid, {
            text: `Selamat datang @${p.split('@')[0]}!`,
            mentions: [p]
          });
        } else if (action === 'remove') {
          await sock.sendMessage(gid, {
            text: `Selamat tinggal @${p.split('@')[0]}!`,
            mentions: [p]
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  });

  // =============== CONNECTION HANDLER ===============
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    // ===== QR DITERIMA → KIRIM FOTO KE NOMOR KAMU
    if (qr) {
      console.log("QR ditemukan → membuat QR PNG untuk dikirim...");

      try {
        const qrBuffer = await qrcode.toBuffer(qr);

        await sock.sendMessage(ownerNumber, {
          image: qrBuffer,
          caption: "Silakan SCAN QR ini untuk login bot kamu 😊"
        });

        console.log("QR terkirim ke WhatsApp kamu!");
      } catch (err) {
        console.error("Gagal membuat/mengirim QR:", err);
      }
    }

    // ===== Connection events
    if (connection === "open") {
      console.log("Bot connected!");
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;

      // Jika bukan logout → reconnect
      if (reason !== DisconnectReason.loggedOut) {
        console.log("Koneksi terputus, mencoba reconnect...");
        start();
      } else {
        console.log("Kamu logout. Hapus folder session dan jalankan ulang.");
      }
    }
  });

  console.log("Bot berjalan. QR akan dikirim ke nomor kamu jika diperlukan.");
}

start();
