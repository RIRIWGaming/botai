export const name = 'menu';
export async function handler({ sock, from }) {
  const text = `📌 MENU UTAMA
!ai [teks] - Chat AI (butuh OPENAI_API_KEY)
!stiker - jadikan gambar sebagai stiker
!ytmp3 [link] - download mp3 dari YouTube
!ytmp4 [link] - download mp4 dari YouTube
!logo [teks] - buat logo gambar
!removebg - kirim foto dengan caption !removebg (butuh REMOVE_BG_API_KEY)
!umur YYYY-MM-DD - hitung umur
!owner - info owner
`;
  await sock.sendMessage(from, { text });
}