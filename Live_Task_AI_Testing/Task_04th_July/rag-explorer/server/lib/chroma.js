import { ChromaClient } from 'chromadb';

const client = new ChromaClient({ path: 'http://localhost:8000' });

let memoryStore = null; // fallback in-memory store

async function chromaAvailable() {
  try {
    await client.heartbeat();
    return true;
  } catch {
    return false;
  }
}

export async function initChroma(collectionName = 'rag-collection') {
  if (await chromaAvailable()) {
    try {
      const collection = await client.getOrCreateCollection({
        name: collectionName,
        metadata: { description: 'RAG Explorer collection' },
      });
      return collection;
    } catch (err) {
      console.error('ChromaDB connection failed. Is ChromaDB running on port 8000?', err.message);
    }
  }
  console.warn('[chroma] ChromaDB server not available — using in-memory fallback store');
  if (!memoryStore) {
    memoryStore = { name: collectionName, docs: [], embeddings: [], metas: [] };
  }
  return wrapMemoryStore(memoryStore);
}

export async function storeChunks(collection, chunks, embeddings) {
  if (collection._isMemory) {
    collection._store.docs = chunks.map((text, i) => text);
    collection._store.embeddings = embeddings.map((e) => [...e]);
    collection._store.metas = chunks.map((_, i) => ({ index: i }));
    return;
  }

  // Clear old data for demo purposes
  try {
    const existing = await collection.get({ limit: 1 });
    if (existing.ids.length > 0) {
      const all = await collection.get({ limit: 10000 });
      await collection.delete({ ids: all.ids });
    }
  } catch { /* no existing data */ }

  const ids = chunks.map((_, i) => `chunk-${i}`);
  const metadatas = chunks.map((_, i) => ({ index: i }));

  await collection.add({ ids, embeddings, documents: chunks, metadatas });
}

export async function retrieve(collection, queryEmbedding, k = 4) {
  if (collection._isMemory) {
    const store = collection._store;
    const scored = store.docs.map((text, i) => {
      const sim = cosineSimilarity(queryEmbedding, store.embeddings[i]);
      return { text, similarity: sim, index: store.metas[i]?.index ?? i, id: `chunk-${i}` };
    });
    scored.sort((a, b) => b.similarity - a.similarity);
    return scored.slice(0, k).map((r) => ({
      id: r.id,
      text: r.text,
      distance: 1 - r.similarity,
      similarity: r.similarity,
      index: r.index,
    }));
  }

  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: k,
    include: ['documents', 'metadatas', 'distances'],
  });

  if (!results.documents[0]) return [];

  return results.documents[0].map((text, i) => ({
    id: results.ids[0][i],
    text,
    distance: results.distances[0][i],
    similarity: Math.max(0, 1 - results.distances[0][i]),
    index: results.metadatas[0][i]?.index ?? i,
  }));
}

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}

function wrapMemoryStore(store) {
  return {
    _isMemory: true,
    _store: store,
    name: store.name,
  };
}
