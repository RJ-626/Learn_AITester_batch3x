// Embed chunks using Ollama nomic-embed-text (primary)
// Falls back to a simple hash-based embedding for demo/demo environments

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const VECTOR_DIM = 768;

async function ollamaAvailable() {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { method: 'GET', signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function embedChunks(chunks) {
  const useOllama = await ollamaAvailable();
  if (!useOllama) {
    console.warn('[embed] Ollama not available — falling back to hash-based demo embeddings');
  }
  const embeddings = [];
  for (const chunk of chunks) {
    const embedding = useOllama ? await embedViaOllama(chunk) : embedViaHash(chunk);
    embeddings.push(embedding);
  }
  return embeddings;
}

export async function embedQuery(text) {
  const useOllama = await ollamaAvailable();
  return useOllama ? embedViaOllama(text) : embedViaHash(text);
}

async function embedViaOllama(text) {
  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'nomic-embed-text', prompt: text }),
  });
  if (!res.ok) throw new Error(`Ollama embed error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return data.embedding;
}

// Deterministic hash-based embedding for environments without Ollama
function embedViaHash(text) {
  const vec = new Float32Array(VECTOR_DIM);
  const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (let i = 0; i < normalized.length; i++) {
    const code = normalized.charCodeAt(i);
    vec[i % VECTOR_DIM] += code / 255;
  }
  // L2-normalise
  let norm = 0;
  for (let i = 0; i < VECTOR_DIM; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < VECTOR_DIM; i++) vec[i] /= norm;
  return Array.from(vec);
}
