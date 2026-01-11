import math
from typing import List


def vectorize(text: str) -> List[float]:
    """
    Deterministic fake embedding (no external deps).
    """
    h = 0
    for ch in text:
        h = ((h << 5) - h) + ord(ch)
        h &= 0xFFFFFFFF

    return [math.sin(h + i) * 100 for i in range(10)]


def cosine_similarity(a: List[float], b: List[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))
    return (dot / (norm_a * norm_b + 1e-10)) * 100
