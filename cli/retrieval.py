from typing import List
from models import RetrievedDoc
from corpus import CORPUS
from vector_utils import vectorize, cosine_similarity


def retrieve(query: str, k: int = 3) -> List[RetrievedDoc]:
    query_vec = vectorize(query)
    results: List[RetrievedDoc] = []

    for doc in CORPUS:
        score = cosine_similarity(query_vec, vectorize(doc.content))
        results.append(
            RetrievedDoc(
                id=doc.id,
                title=doc.title,
                content=doc.content,
                score=score,
                tokens=len(doc.content.split()),
            )
        )

    results.sort(key=lambda d: d.score, reverse=True)
    return results[:k]
