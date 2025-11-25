export const name = 'ai';
export async function handler({ sock, args, from }) {
  const prompt = args.join(' ');
  const reply = await (await import('../lib/ai.js')).aiChat(prompt);
  await sock.sendMessage(from, { text: reply });
}