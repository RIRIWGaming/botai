import fs from "fs";

export async function makeStickerFromBuffer(sock, jid, buffer, metadata={}) {
  await sock.sendMessage(jid, { sticker: buffer });
}

export async function makeSticker(sock, message) {
  const jid = message.key.remoteJid;
  try {
    const stream = await sock.downloadMediaMessage(message);
    const buffer = Buffer.from(await stream.arrayBuffer());
    await makeStickerFromBuffer(sock, jid, buffer);
  } catch (e) {
    await sock.sendMessage(jid, { text: 'Gagal membuat stiker. Kirim gambar dengan caption !stiker' });
  }
}