import { BUDGETS, enforceBudget, type BudgetKey } from './budget';
import {
  retrieveDocuments,
  type RetrievedDoc,
} from './retrieval';
import { estimateTokens } from './tokenizer';

/* ----------------------------- */
/* Section model                 */
/* ----------------------------- */
export interface Section {
  name: BudgetKey;
  content: string;
  source: string;
  priority: number;

  truncated: boolean;

  originalTokens: number;
  finalTokens: number;
  truncatedTokens: number;

  /* Retrieval-only metadata */
  details?: RetrievedDoc[];
}

/* ----------------------------- */
/* Assemble result               */
/* ----------------------------- */
export interface AssembleResult {
  sections: Section[];
  budgets: Record<BudgetKey, number>;
  finalContext: string;
}

/* ----------------------------- */
/* Context assembly              */
/* ----------------------------- */
export function assembleContext(
  query: string,
  memory = '',
  toolOutputs = ''
): AssembleResult {
  /* ----------------------------- */
  /* Base sections (pre-truncation) */
  /* ----------------------------- */
  const sections: Section[] = [
    {
      name: 'instructions',
      content:
        'You are an AI assistant specialized in machine learning and AI concepts. Answer accurately and concisely. If information is missing, say so explicitly.',
      source: 'System',
      priority: 1,
      truncated: false,
      originalTokens: 0,
      finalTokens: 0,
      truncatedTokens: 0,
    },
    {
      name: 'goal',
      content: query,
      source: 'User Query',
      priority: 2,
      truncated: false,
      originalTokens: 0,
      finalTokens: 0,
      truncatedTokens: 0,
    },
    {
      name: 'memory',
      content: memory,
      source: 'Conversation Memory',
      priority: 3,
      truncated: false,
      originalTokens: 0,
      finalTokens: 0,
      truncatedTokens: 0,
    },
    {
      name: 'retrieval',
      content: '',
      source: 'Vector Retrieval',
      priority: 4,
      truncated: false,
      originalTokens: 0,
      finalTokens: 0,
      truncatedTokens: 0,
    },
    {
      name: 'toolOutputs',
      content: toolOutputs,
      source: 'Recent Tool Outputs',
      priority: 5,
      truncated: false,
      originalTokens: 0,
      finalTokens: 0,
      truncatedTokens: 0,
    },
  ];

  /* ----------------------------- */
  /* Enforce budgets (non-retrieval) */
  /* ----------------------------- */
  for (const section of sections) {
    if (section.name === 'retrieval') continue;

    const originalTokens = estimateTokens(section.content);
    const enforced = enforceBudget(
      section.content,
      BUDGETS[section.name]
    );
    const finalTokens = estimateTokens(enforced.content);

    section.content = enforced.content;
    section.truncated = enforced.truncated;
    section.originalTokens = originalTokens;
    section.finalTokens = finalTokens;
    section.truncatedTokens = originalTokens - finalTokens;
  }

  /* ----------------------------- */
  /* Deterministic retrieval        */
  /* ----------------------------- */
  const retrievalResult = retrieveDocuments(query);
  const retrievalSection = sections.find(
    s => s.name === 'retrieval'
  )!;

  retrievalSection.content = retrievalResult.text;
  retrievalSection.details = retrievalResult.details;

  const totalRetrievalTokens = retrievalResult.details.reduce(
    (sum, doc) => sum + doc.tokens,
    0
  );

  retrievalSection.originalTokens = totalRetrievalTokens;
  retrievalSection.finalTokens = retrievalResult.tokensUsed;
  retrievalSection.truncatedTokens =
    totalRetrievalTokens - retrievalResult.tokensUsed;

  retrievalSection.truncated = retrievalResult.details.some(
    d => !d.included
  );

  /* ----------------------------- */
  /* Final context assembly         */
  /* ----------------------------- */
  const finalContext = sections
    .sort((a, b) => a.priority - b.priority)
    .map(s => s.content)
    .join('\n---\n');

  return {
    sections,
    budgets: BUDGETS,
    finalContext,
  };
}
