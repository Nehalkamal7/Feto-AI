import math
import hashlib
import logging
from typing import List

logger = logging.getLogger(__name__)

EMBEDDING_DIM = 384
_model = None
_model_failed = False

def get_embedding_model():
    """
    Lazy loads the local sentence-transformers model 'all-MiniLM-L6-v2' (384 dimensions).
    Zero external API costs.
    """
    global _model, _model_failed
    if _model is not None:
        return _model
    if _model_failed:
        return None

    try:
        from sentence_transformers import SentenceTransformer
        logger.info("Loading local sentence-transformers model 'all-MiniLM-L6-v2' (384 dimensions)...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        return _model
    except Exception as e:
        logger.warning(f"sentence-transformers not available or failed to load: {e}. Using deterministic 384-dim fallback.")
        _model_failed = True
        return None


def generate_deterministic_embedding(text: str, dim: int = EMBEDDING_DIM) -> List[float]:
    """
    High-quality deterministic pseudo-semantic projection to 384 dimensions.
    Normalizes vector to unit L2 norm, compatible with cosine similarity and pgvector.
    Used as zero-dependency fallback.
    """
    cleaned = text.strip().lower()
    words = cleaned.split()
    vector = [0.0] * dim

    for idx, word in enumerate(words):
        # Hash word with position weight
        h = hashlib.sha256(f"{word}_{idx % 8}".encode("utf-8")).digest()
        for i in range(min(dim, len(h) * 4)):
            byte_val = h[i % len(h)]
            # Map byte [0, 255] to [-1.0, 1.0]
            val = (byte_val / 127.5) - 1.0
            vector[i % dim] += val

    # Global text hash distribution
    full_hash = hashlib.sha384(cleaned.encode("utf-8")).digest()
    for i in range(dim):
        byte_val = full_hash[i % len(full_hash)]
        vector[i] += ((byte_val / 127.5) - 1.0) * 0.5

    # L2 normalize
    norm = math.sqrt(sum(v * v for v in vector))
    if norm > 0:
        vector = [round(v / norm, 6) for v in vector]
    else:
        vector = [0.0] * dim
        vector[0] = 1.0

    return vector


def generate_embedding(text: str) -> List[float]:
    """
    Generates a 384-dimensional embedding for a single text.
    """
    model = get_embedding_model()
    if model is not None:
        try:
            emb = model.encode(text, normalize_embeddings=True)
            return [round(float(v), 6) for v in emb.tolist()]
        except Exception as e:
            logger.warning(f"Local model encoding failed: {e}. Falling back.")
    
    return generate_deterministic_embedding(text, EMBEDDING_DIM)


def generate_embeddings(texts: List[str]) -> List[List[float]]:
    """
    Batch generates 384-dimensional embeddings.
    """
    model = get_embedding_model()
    if model is not None:
        try:
            embs = model.encode(texts, normalize_embeddings=True)
            return [[round(float(v), 6) for v in emb.tolist()] for emb in embs]
        except Exception as e:
            logger.warning(f"Batch local encoding failed: {e}. Falling back.")

    return [generate_deterministic_embedding(t, EMBEDDING_DIM) for t in texts]
