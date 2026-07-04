// Embed chunks using Ollama nomic-embed-text

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

export async function embedChunks(chunks) {
  const embeddings = [];
  for (const chunk of chunks) {
    const embedding = await embedText(chunk);
    embeddings.push(embedding);
  }
  return embeddings;
}

export async function embedQuery(text) {
  return embedText(text);
}

async function embedText(text) {
  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'nomic-embed-text',
      prompt: text,
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama embed error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.embedding;
}
