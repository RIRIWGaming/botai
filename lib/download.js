import ytdl from "ytdl-core";

export async function ytDownload(sock, jid, url, format='mp3') {
  try {
    if (!url) return sock.sendMessage(jid, { text: "Masukan link YouTube." });
    if (!ytdl.validateURL(url)) {
      return sock.sendMessage(jid, { text: "Link YouTube tidak valid." });
    }
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^a-z0-9 \-_.]/gi,'').slice(0,120);
    await sock.sendMessage(jid, { text: `Mengunduh: ${title}` });

    const filter = format === 'mp3' ? 'audioonly' : null;
    const stream = ytdl(url, { filter });

    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    if (format === 'mp3') {
      await sock.sendMessage(jid, {
        document: buffer,
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
      });
    } else {
      await sock.sendMessage(jid, {
        document: buffer,
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`
      });
    }
  } catch (err) {
    await sock.sendMessage(jid, { text: "Gagal download: " + err.message });
  }
}

export async function tiktokDownload(sock, jid, url) {
  await sock.sendMessage(jid, { text: "TikTok downloader belum diimplementasikan. Bisa menggunakan API pihak ketiga." });
}

export async function igDownload(sock, jid, url) {
  await sock.sendMessage(jid, { text: "Instagram downloader belum diimplementasikan. Bisa menggunakan API pihak ketiga." });
}