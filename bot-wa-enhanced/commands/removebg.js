export const name = 'removebg';
export async function handler({ sock, message, from }) {
  try {
    const tools = await import('../lib/tools.js');
    const stream = await sock.downloadMediaMessage(message);
    const buffer = Buffer.from(await stream.arrayBuffer());
    const result = await tools.removeBg(buffer);
    await sock.sendMessage(from, { image: result, caption: 'Background dihapus' });
  } catch (e) {
    await sock.sendMessage(from, { text: 'Gagal removebg: ' + e.message });
  }
}