import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function askGroq(prompt) {
  const response = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [
      { role: 'system', content: 'You are a helpful QA documentation assistant. Answer based ONLY on the provided document chunks.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
    max_tokens: 2048,
  });

  return response.choices[0].message.content;
}
