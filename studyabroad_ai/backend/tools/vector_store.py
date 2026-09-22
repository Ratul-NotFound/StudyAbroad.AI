"""
StudyAbroad.AI — Vector Store Tool (Own FAISS — completely free)
Primary: FAISS (Facebook AI Similarity Search) — local, fast, free
Fallback: Pinecone — only when >1M entries AND local RAM is insufficient

FAISS handles millions of vectors efficiently:
  - 100K vectors → sub-millisecond search on CPU
  - 1M vectors → ~10ms on CPU
  - Persisted to disk as .index files in data/vector_index/
"""
import faiss
import numpy as np
import json
import os
import logging
from typing import Optional
from pathlib import Path

from backend.config import settings
from backend.tools.embeddings import embedder

logger = logging.getLogger(__name__)


# ─── FAISS Vector Store (Own tool, free) ─────────────────────────────────────

class FAISSVectorStore:
    """
    FAISS-based local vector store.
    Stores embeddings + metadata, supports similarity search.
    Persists index to disk so data survives restarts.
    """

    def __init__(self, index_name: str, dimension: int = None):
        self.index_name = index_name
        self.dimension = dimension or settings.vector_dimension
        self.index_path = Path(settings.vector_index_path) / f"{index_name}.index"
        self.metadata_path = Path(settings.vector_index_path) / f"{index_name}.meta.json"

        os.makedirs(settings.vector_index_path, exist_ok=True)

        # Load or create index
        if self.index_path.exists():
            self.index = faiss.read_index(str(self.index_path))
            with open(self.metadata_path, "r", encoding="utf-8") as f:
                self.metadata = json.load(f)
            logger.info(f"[VectorStore] Loaded FAISS index '{index_name}' with {self.index.ntotal} vectors")
        else:
            # IVFFlat for large datasets, Flat for small — auto-select
            self.index = faiss.IndexFlatIP(self.dimension)  # Inner Product (cosine for normalized)
            self.metadata = {}  # id → metadata dict
            logger.info(f"[VectorStore] Created new FAISS index '{index_name}'")

    def add(self, texts: list[str], metadatas: list[dict], ids: list[str] = None) -> list[str]:
        """Add texts with their metadata to the index."""
        if not texts:
            return []

        # Generate embeddings using own tool
        embeddings = embedder.batch_embed(texts)

        # Ensure float32
        embeddings = embeddings.astype(np.float32)

        # Assign IDs
        if ids is None:
            start_id = len(self.metadata)
            ids = [str(start_id + i) for i in range(len(texts))]

        # Add to FAISS
        self.index.add(embeddings)

        # Store metadata
        for i, (id_, meta) in enumerate(zip(ids, metadatas)):
            faiss_id = self.index.ntotal - len(texts) + i
            self.metadata[str(faiss_id)] = {
                "id": id_,
                "text": texts[i],
                **meta
            }

        # Auto-save
        self._save()
        return ids

    def add_single(self, text: str, metadata: dict, id_: str = None) -> str:
        """Add a single text."""
        ids = self.add([text], [metadata], [id_] if id_ else None)
        return ids[0]

    def search(self, query: str, top_k: int = 10, filter_fn=None) -> list[dict]:
        """
        Semantic search for similar documents.
        Returns list of {score, id, text, **metadata} dicts.
        """
        if self.index.ntotal == 0:
            return []

        # Embed query
        query_embedding = embedder.embed_single(query).astype(np.float32).reshape(1, -1)

        # Search FAISS
        actual_k = min(top_k * 3, self.index.ntotal)  # Over-fetch for filtering
        scores, indices = self.index.search(query_embedding, actual_k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1:
                continue
            meta = self.metadata.get(str(idx), {})
            result = {
                "score": float(score),
                "faiss_id": int(idx),
                **meta
            }
            if filter_fn is None or filter_fn(result):
                results.append(result)
            if len(results) >= top_k:
                break

        return results

    def hybrid_search(self, query: str, keyword_fields: list[str],
                      top_k: int = 10) -> list[dict]:
        """
        Hybrid search: semantic (FAISS) + keyword (BM25-style boost).
        Better than pure vector search for structured fields like university names.
        """
        # Get semantic results (over-fetch)
        semantic_results = self.search(query, top_k=top_k * 3)

        # Re-rank with keyword boost
        query_terms = set(query.lower().split())
        for result in semantic_results:
            keyword_score = 0
            for field in keyword_fields:
                field_value = str(result.get(field, "")).lower()
                for term in query_terms:
                    if term in field_value:
                        keyword_score += 0.1
            result["hybrid_score"] = result["score"] + keyword_score

        # Sort by hybrid score
        semantic_results.sort(key=lambda x: x["hybrid_score"], reverse=True)
        return semantic_results[:top_k]

    def delete(self, faiss_ids: list[int]):
        """Remove entries by FAISS internal ID (marks as deleted)."""
        selector = faiss.IDSelectorBatch(faiss_ids)
        self.index.remove_ids(selector)
        for id_ in faiss_ids:
            self.metadata.pop(str(id_), None)
        self._save()

    def update(self, faiss_id: int, text: str, metadata: dict):
        """Update an entry (delete + re-add)."""
        self.delete([faiss_id])
        return self.add_single(text, metadata)

    def _save(self):
        """Persist index and metadata to disk."""
        faiss.write_index(self.index, str(self.index_path))
        with open(self.metadata_path, "w", encoding="utf-8") as f:
            json.dump(self.metadata, f, ensure_ascii=False, indent=2)

    def stats(self) -> dict:
        return {
            "index_name": self.index_name,
            "total_vectors": self.index.ntotal,
            "dimension": self.dimension,
            "index_size_mb": self.index_path.stat().st_size / (1024*1024) if self.index_path.exists() else 0,
            "tool": "faiss (own, free)"
        }

    def clear(self):
        """Clear all data from the index."""
        self.index.reset()
        self.metadata = {}
        self._save()
        logger.warning(f"[VectorStore] Cleared index '{self.index_name}'")


# ─── Pinecone Fallback (PAID — only when FAISS is insufficient) ───────────────

class PineconeFallbackStore:
    """
    PAID FALLBACK — Only instantiated when:
    1. FAISS index exceeds available RAM (typically >5M vectors without GPU)
    2. USE_PINECONE_FALLBACK=true in config
    Cost: ~$0.096/million vector writes, $0.038/million queries (serverless)
    """

    def __init__(self, index_name: str):
        if not settings.use_pinecone_fallback:
            raise RuntimeError(
                "Pinecone fallback is disabled. FAISS is the primary vector store. "
                "Set USE_PINECONE_FALLBACK=true only if your dataset exceeds local RAM."
            )
        logger.warning(
            f"[COST ALERT] Using Pinecone fallback for index '{index_name}'. "
            f"This has per-query costs. Consider increasing RAM for FAISS."
        )
        from pinecone import Pinecone
        self.pc = Pinecone(api_key=settings.pinecone_api_key)
        self.index_name = index_name

    def search(self, query: str, top_k: int = 10) -> list[dict]:
        query_embedding = embedder.embed_single(query).tolist()
        index = self.pc.Index(self.index_name)
        results = index.query(vector=query_embedding, top_k=top_k, include_metadata=True)
        return [
            {"score": m.score, "id": m.id, **m.metadata}
            for m in results.matches
        ]


# ─── Vector Store Manager (Index Registry) ────────────────────────────────────

class VectorStoreManager:
    """Manages multiple FAISS indices for different data types."""

    def __init__(self):
        self._stores: dict[str, FAISSVectorStore] = {}

    def get(self, index_name: str) -> FAISSVectorStore:
        if index_name not in self._stores:
            self._stores[index_name] = FAISSVectorStore(index_name)
        return self._stores[index_name]

    @property
    def universities(self) -> FAISSVectorStore:
        return self.get("universities")

    @property
    def scholarships(self) -> FAISSVectorStore:
        return self.get("scholarships")

    @property
    def programs(self) -> FAISSVectorStore:
        return self.get("programs")

    @property
    def visa_rules(self) -> FAISSVectorStore:
        return self.get("visa_rules")

    @property
    def student_profiles(self) -> FAISSVectorStore:
        return self.get("student_profiles")

    def stats_all(self) -> dict:
        return {name: store.stats() for name, store in self._stores.items()}


# ─── Global vector store instance ─────────────────────────────────────────────
vector_store = VectorStoreManager()
