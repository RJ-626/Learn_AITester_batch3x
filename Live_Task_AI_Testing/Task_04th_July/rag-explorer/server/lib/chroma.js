import { ChromaClient } from 'chromadb';

const client = new ChromaClient({ path: 'http://localhost:8000' });

export async function initChroma(collectionName = 'rag-collection') {
  try {
    const collection = await client.getOrCreateCollection({
      name: collectionName,
      metadata: { description: 'RAG Explorer collection' },
    });
    return collection;
  } catch (err) {
    console.error('ChromaDB connection failed. Is ChromaDB running on port 8000?', err.message);
    throw err;
  }
}

export async function storeChunks(collection, chunks, embeddings) {
  // Clear old data for demo purposes
  const existing = await collection.get({ limit: 1 });
  if (existing.ids.length > 0) {
    const all = await collection.get({ limit: 10000 });
    await collection.delete({ ids: all.ids });
  }

  const ids = chunks.map((_, i) => `chunk-${i}`);
  const metadatas = chunks.map((_, i) => ({ index: i }));

  await collection.add({
    ids,
    embeddings,
    documents: chunks,
    metadatas,
  });
}

export async function retrieve(collection, queryEmbedding, k = 4) {
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
