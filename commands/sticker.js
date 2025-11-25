export const name = 'stiker';
export async function handler({ sock, message, from }) {
  const lib = await import('../lib/sticker.js');
  await lib.makeSticker(sock, message);
}