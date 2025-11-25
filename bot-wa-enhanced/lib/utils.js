import fs from "fs";
import path from "path";

export async function loadCommands(folder='./commands') {
  const commands = {};
  const files = fs.readdirSync(folder);
  for (const f of files) {
    if (!f.endsWith('.js')) continue;
    const mod = await import(path.resolve(folder, f));
    const name = mod.name || f.replace('.js','');
    commands[name] = { ...(mod), filename: f };
  }
  return commands;
}

export function isCommand(text, prefix='!') {
  if (!text.startsWith(prefix)) return null;
  const without = text.slice(prefix.length).trim();
  const parts = without.split(/\s+/);
  return { name: parts[0].toLowerCase(), args: parts.slice(1) };
}

export function hitungUmur(dob) {
  try {
    const [y,m,d] = dob.split('-').map(Number);
    const born = new Date(y,m-1,d);
    const now = new Date();
    let age = now.getFullYear() - born.getFullYear();
    const mDiff = now.getMonth() - born.getMonth();
    if (mDiff < 0 || (mDiff === 0 && now.getDate() < born.getDate())) age--;
    return age + ' tahun';
  } catch(e) { return 'Format salah (YYYY-MM-DD)'; }
}