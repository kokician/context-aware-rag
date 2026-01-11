import { estimateTokens } from './tokenizer';

export type BudgetKey =
  | 'instructions'
  | 'goal'
  | 'memory'
  | 'retrieval'
  | 'toolOutputs';

export const BUDGETS: Record<BudgetKey, number> = {
  instructions: 255,
  goal: 1500,
  memory: 55,
  retrieval: 550,
  toolOutputs: 855
};

export function enforceBudget(
  content: string,
  budget: number
): { content: string; truncated: boolean } {
  const tokens = estimateTokens(content);
  if (tokens <= budget) {
    return { content, truncated: false };
  }

  const ratio = budget / tokens;
  return {
    content: content.slice(0, Math.floor(content.length * ratio)),
    truncated: true
  };
}
