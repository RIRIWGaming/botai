export const name = 'ytmp4';
export async function handler({ sock, args, from }) {
  const url = args[0];
  await (await import('../lib/download.js')).ytDownload(sock, from, url, 'mp4');
}