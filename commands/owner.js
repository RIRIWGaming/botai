export const name = 'owner';
export async function handler({ sock, from, config }) {
  await sock.sendMessage(from, { text: `Owner: ${config.owner}` });
}