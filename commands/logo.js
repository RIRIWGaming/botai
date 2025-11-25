export const name = 'logo';
export async function handler({ sock, args, from }) {
  const text = args.join(' ') || 'LOGO';
  const buf = await (await import('../lib/tools.js')).logoMaker(text);
  await sock.sendMessage(from, { image: buf, caption: 'Logo dibuat' });
}