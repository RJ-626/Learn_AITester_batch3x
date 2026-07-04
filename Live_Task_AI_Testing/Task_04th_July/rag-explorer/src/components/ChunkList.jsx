export default function ChunkList({ chunks }) {
  return (
    <div className="chunk-list">
      {chunks.map((chunk, i) => (
        <div key={chunk.id} className="chunk-card">
          <div className="chunk-header">
            <span className="chunk-badge">Chunk {i + 1}</span>
            <span className="chunk-score">
              Similarity: {(chunk.similarity * 100).toFixed(1)}%
            </span>
          </div>
          <div className="chunk-distance">Distance: {chunk.distance.toFixed(4)}</div>
          <pre className="chunk-text">{chunk.text}</pre>
        </div>
      ))}
    </div>
  );
}
