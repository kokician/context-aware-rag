from models import CorpusDoc

CORPUS = [
    CorpusDoc(
        id="doc1",
        title="Machine Learning Basics",
        content=(
            "Machine learning enables systems to learn from data and improve "
            "performance without explicit programming."
        ),
    ),
    CorpusDoc(
        id="doc2",
        title="Neural Networks",
        content=(
            "Neural networks are inspired by biological neurons and consist "
            "of interconnected layers of nodes."
        ),
    ),
    CorpusDoc(
        id="doc3",
        title="Transformers",
        content=(
            "Transformers rely on attention mechanisms to process sequences "
            "in parallel and model long-range dependencies."
        ),
    ),
    CorpusDoc(
        id="doc4",
        title="Vector Embeddings",
        content=(
            "Embeddings represent text as vectors where semantic similarity "
            "corresponds to geometric proximity."
        ),
    ),
]
