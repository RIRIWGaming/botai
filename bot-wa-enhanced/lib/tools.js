import fetch from "node-fetch";
import fs from "fs";
import FormData from "form-data";
import { createCanvas, loadImage } from "canvas";

export async function removeBg(imageBuffer) {
  const key = process.env.REMOVE_BG_API_KEY || '';
  if (!key) throw new Error('REMOVE_BG_API_KEY not set');
  const form = new FormData();
  form.append('image_file', imageBuffer, 'image.jpg');
  const res = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: { 'X-Api-Key': key },
    body: form
  });
  if (!res.ok) throw new Error('remove.bg error ' + res.status);
  const buf = await res.arrayBuffer();
  return Buffer.from(buf);
}

export async function logoMaker(text, opts = {}) {
  const width = opts.width || 800;
  const height = opts.height || 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const g = ctx.createLinearGradient(0,0,width,0);
  g.addColorStop(0, '#4e54c8');
  g.addColorStop(1, '#8f94fb');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,width,height);

  ctx.font = 'bold 80px Sans';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width/2, height/2);

  return canvas.toBuffer('image/png');
}