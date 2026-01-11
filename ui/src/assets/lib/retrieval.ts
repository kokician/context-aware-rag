import { estimateTokens } from './tokenizer';
import { BUDGETS } from './budget';

export interface RetrievedDoc {
  id: string;
  title: string;
  content: string;
  score: number;
  tokens: number;
  included: boolean;
  tokensUsed: number;
  reason: string;
}

// Deterministic vectorizer
const vectorize = (text: string): number[] =>
  Array(10)
    .fill(0)
    .map((_, i) => Math.sin(text.length + i) * 100);

const cosineSimilarity = (a: number[], b: number[]): number => {
  const dot = a.reduce((s, v, i) => s + v * b[i], 0);
  const na = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const nb = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  return (dot / (na * nb + 1e-9)) * 100;
};

const CORPUS = [
  {
    id: 'doc1',
    title: 'Machine Learning Basics',
    content:
      'Machine learning is a subset of artificial intelligence that enables systems to learn from data.'
  },
  {
    id: 'doc2',
    title: 'Neural Networks',
    content:
      'Neural networks are computational models inspired by biological neurons.'
  },
  {
    id: 'doc3',
    title: 'Transformers Architecture',
    content:
      'Transformers use attention mechanisms to process sequences in parallel.'
  },
  {
    id: 'doc4',
    title: 'Vector Embeddings',
    content:
      'Vector embeddings represent text as continuous numerical vectors.'
  },
  {
    id: 'doc5',
    title: 'RAG Systems',
    content:
      'Retrieval-Augmented Generation combines a retriever with a generator.'
  }
];

export function retrieveDocuments(query: string): {
  text: string;
  details: RetrievedDoc[];
  tokensUsed: number;
} {
  const queryVec = vectorize(query);

  const scored = CORPUS.map(doc => {
    const score = cosineSimilarity(queryVec, vectorize(doc.content));
    return { ...doc, score, tokens: estimateTokens(doc.content) };
  }).sort((a, b) => b.score - a.score);

  let usedTokens = 0;
  let text = '';
  const details: RetrievedDoc[] = [];

  for (const doc of scored) {
    if (usedTokens + doc.tokens <= BUDGETS.retrieval) {
      text += `[${doc.id.toUpperCase()}] ${doc.title}\n${doc.content}\n\n`;
      usedTokens += doc.tokens;

      details.push({
        ...doc,
        included: true,
        tokensUsed: doc.tokens,
        reason: 'Within retrieval budget'
      });
    } else {
      details.push({
        ...doc,
        included: false,
        tokensUsed: 0,
        reason: 'Excluded: retrieval budget exceeded'
      });
    }
  }

  return { text, details, tokensUsed: usedTokens };
}
