"""
StudyAbroad.AI — Embeddings Tool (Own Tool — fastembed, completely free)
=========================================================================
Primary: fastembed (BAAI/bge-small-en-v1.5) — runs on CPU, no TensorFlow/Keras needed
Fallback: OpenAI embeddings — only if accuracy is critically insufficient

Why fastembed over sentence-transformers:
  - No TensorFlow dependency (avoids global TF/Keras conflicts)
  - No PyTorch needed for inference
  - Pure ONNX runtime — lightweight and fast
  - 384-dim embeddings, competitive quality
  - ~25MB model size vs ~80MB
  - Perfect for production CPU deployments

fastembed free models available:
  - BAAI/bge-small-en-v1.5   (384-dim, fast, default)
  - BAAI/bge-base-en-v1.5    (768-dim, better quality)
  - BAAI/bge-large-en-v1.5   (1024-dim, best quality, larger)
  - sentence-transformers/all-MiniLM-L6-v2 (384-dim)
"""
import numpy as np
import logging
import os
from typing import Union

# Suppress TF/oneDNN logs if TF is globally installed
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "3")
os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")
os.environ.setdefault("PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION", "python")

from backend.config import settings

logger = logging.getLogger(__name__)


# ─── FastEmbed Embedder (Own tool — free, no TF/PyTorch needed) ───────────────

class FastEmbedder:
    """
    Local CPU embeddings using fastembed + ONNX runtime.
    No TensorFlow. No GPU. No paid APIs.
    ~25MB model, runs fast on any CPU.
    """
    _model = None
    _model_name = None

    # Model configs: name → (fastembed_name, dimension)
    MODELS = {
        "BAAI/bge-small-en-v1.5": ("BAAI/bge-small-en-v1.5", 384),
        "BAAI/bge-base-en-v1.5": ("BAAI/bge-base-en-v1.5", 768),
        "all-MiniLM-L6-v2": ("sentence-transformers/all-MiniLM-L6-v2", 384),
    }

    def __init__(self, model_name: str = "BAAI/bge-small-en-v1.5"):
        # Always use BAAI/bge-small-en-v1.5 unless explicitly overridden
        # This avoids picking up old/wrong model names from cached settings
        cfg_model = settings.embeddings_model
        # If config has the fastembed model name, use it; otherwise use our default
        if cfg_model and cfg_model in self.MODELS:
            self.model_name = cfg_model
        else:
            self.model_name = "BAAI/bge-small-en-v1.5"

    def _load_model(self):
        """Lazy-load model on first use."""
        if FastEmbedder._model is None or FastEmbedder._model_name != self.model_name:
            logger.info(f"[Embeddings] Loading fastembed model: {self.model_name} (own tool, free, no GPU)")
            from fastembed import TextEmbedding
            FastEmbedder._model = TextEmbedding(self.model_name)
            FastEmbedder._model_name = self.model_name
            logger.info(f"[Embeddings] Model ready — {self.model_name}")
        return FastEmbedder._model

    def embed(self, texts: Union[str, list[str]]) -> np.ndarray:
        """Embed texts into vectors. Returns numpy float32 array."""
        if isinstance(texts, str):
            texts = [texts]
        model = self._load_model()
        embeddings = list(model.embed(texts))
        arr = np.array(embeddings, dtype=np.float32)
        # Normalize for cosine similarity
        norms = np.linalg.norm(arr, axis=1, keepdims=True)
        arr = arr / np.where(norms > 0, norms, 1.0)
        return arr

    def embed_single(self, text: str) -> np.ndarray:
        """Embed a single text into a 1D vector."""
        return self.embed([text])[0]

    def similarity(self, text1: str, text2: str) -> float:
        """Cosine similarity between two texts."""
        emb1 = self.embed_single(text1)
        emb2 = self.embed_single(text2)
        return float(np.dot(emb1, emb2))

    def batch_embed(self, texts: list[str], batch_size: int = 64) -> np.ndarray:
        """Efficient batch embedding."""
        model = self._load_model()
        all_embeddings = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            embeddings = list(model.embed(batch))
            all_embeddings.extend(embeddings)

        arr = np.array(all_embeddings, dtype=np.float32)
        norms = np.linalg.norm(arr, axis=1, keepdims=True)
        arr = arr / np.where(norms > 0, norms, 1.0)
        return arr

    @property
    def dimension(self) -> int:
        _, dim = self.MODELS.get(self.model_name, (None, 384))
        return dim


# ─── OpenAI Embeddings (PAID FALLBACK — disabled by default) ──────────────────

class OpenAIEmbeddingsFallback:
    """
    PAID FALLBACK — Only when fastembed quality is insufficient.
    Set OPENAI_EMBEDDINGS_FALLBACK=true in .env to enable.
    Cost: ~$0.00002 per 1K tokens
    """

    def __init__(self):
        if not settings.openai_api_key:
            raise ValueError("OpenAI embeddings require OPENAI_API_KEY")
        logger.warning(
            "[COST ALERT] Using OpenAI embeddings fallback. "
            "Cost: ~$0.00002/1K tokens. fastembed is usually sufficient."
        )

    def embed(self, texts: Union[str, list[str]]) -> np.ndarray:
        from openai import OpenAI
        client = OpenAI(api_key=settings.openai_api_key)
        if isinstance(texts, str):
            texts = [texts]
        response = client.embeddings.create(
            model=settings.embeddings_fallback_model,
            input=texts
        )
        return np.array([item.embedding for item in response.data], dtype=np.float32)

    def embed_single(self, text: str) -> np.ndarray:
        return self.embed([text])[0]


# ─── Embeddings Router ────────────────────────────────────────────────────────

class EmbeddingsRouter:
    """Routes to fastembed (own, free) first, OpenAI paid fallback only if configured."""

    def __init__(self):
        self._embedder = FastEmbedder()
        self._fallback = None

    def embed(self, texts: Union[str, list[str]]) -> np.ndarray:
        try:
            return self._embedder.embed(texts)
        except Exception as e:
            logger.error(f"[Embeddings] fastembed failed: {e}")
            if settings.openai_embeddings_fallback and settings.openai_api_key:
                logger.warning("[PAID FALLBACK] Switching to OpenAI embeddings")
                if self._fallback is None:
                    self._fallback = OpenAIEmbeddingsFallback()
                return self._fallback.embed(texts)
            raise

    def embed_single(self, text: str) -> np.ndarray:
        return self.embed([text] if isinstance(text, str) else text)[0]

    def batch_embed(self, texts: list[str], batch_size: int = 64) -> np.ndarray:
        try:
            return self._embedder.batch_embed(texts, batch_size)
        except Exception as e:
            logger.error(f"[Embeddings] Batch embed failed: {e}")
            if settings.openai_embeddings_fallback and settings.openai_api_key:
                if self._fallback is None:
                    self._fallback = OpenAIEmbeddingsFallback()
                return self._fallback.embed(texts)
            raise

    def similarity(self, text1: str, text2: str) -> float:
        emb1 = self.embed_single(text1)
        emb2 = self.embed_single(text2)
        return float(np.dot(emb1, emb2))

    @property
    def dimension(self) -> int:
        return self._embedder.dimension


# ─── Global embedder ──────────────────────────────────────────────────────────
embedder = EmbeddingsRouter()
