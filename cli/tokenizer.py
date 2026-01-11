import math


def estimate_tokens(text: str) -> int:
    """
    Rough token estimator (~4 chars per token).
    """
    return math.ceil(len(text) / 4) if text else 0
