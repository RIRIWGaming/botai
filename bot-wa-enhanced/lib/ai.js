import fetch from "node-fetch";

const API_KEY = process.env.OPENAI_API_KEY || '';

export async function aiChat(prompt) {
  if (!API_KEY) {
    return `AI belum dikonfigurasi. Set environment variable OPENAI_API_KEY.`;
  }
  if (!prompt) return '';

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Kamu adalah asisten yang membantu lewat WhatsApp. Jawab singkat dan jelas dalam bahasa Indonesia jika diminta." },
          { role: "user", content: prompt }
        ],
        max_tokens: 800
      })
    });
    const data = await res.json();
    if (data.error) return "OpenAI error: " + (data.error.message || JSON.stringify(data.error));
    return data.choices?.[0]?.message?.content || "Tidak ada jawaban dari AI.";
  } catch (e) {
    return "AI Error: " + e.message;
  }
}

export async function aiVision(imageBuffer) {
  return "Vision belum dikonfigurasi. Tambahkan integrasi Vision jika diperlukan.";
}