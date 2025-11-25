import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";

import fs from "fs";
import pino from "pino";
import path from "path";

import { loadCommands } from "./lib/utils.js";
import * as ai from "./lib/ai.js";
import * as sticker from "./lib/sticker.js";
import * as dl from "./lib/download.js";
import * as tools from "./lib/tools.js";

const config = JSON.parse(fs.readFileSync('./config.json'));

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    printQRInTerminal: true,
    logger: pino({ level: 'silent' }),
    auth: state
  });

  sock.ev.on('creds.update', saveCreds);

  // Load commands
  const commands = await loadCommands('./commands');

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

      // AI auto reply (private chat only)
      if (text && !text.startsWith(prefix)) {
        if (!from.endsWith('@g.us')) {
          const reply = await ai.aiChat(text).catch(() => null);
          if (reply) {
            await sock.sendMessage(from, { text: reply });
            return;
          }
        }
      }

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

  // welcome
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

  // reconnect logic
  sock.ev.on('connection.update', (u) => {
    const { connection } = u;
    if (connection === 'close') {
      console.log('Koneksi terputus, mencoba reconnect...');
      start();
    }
  });

  console.log("Bot berjalan. Scan QR di terminal jika diminta.");
}

start();
