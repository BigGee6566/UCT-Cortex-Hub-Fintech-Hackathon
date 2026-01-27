import type { Transaction, Category } from '@/types/finance';

export type HealthScore = {
  score: number; // 0..100
  savingsRate: number; // 0..1
  budgetUtilisation: number; // 0..1 (1 = perfectly on budget or under)
};

export function computeHealthScore(
  txs: Transaction[],
  budgets: Record<Category, number>
): HealthScore {
  const income = txs.filter((t) => t.amount > 0).reduce((a, b) => a + b.amount, 0);
  const expenses = txs.filter((t) => t.amount < 0).reduce((a, b) => a + Math.abs(b.amount), 0);

  const savings = Math.max(0, income - expenses);
  const savingsRate = income > 0 ? savings / income : 0;

  // category spend vs budget
  const spendByCat: Record<string, number> = {};
  for (const t of txs) {
    if (t.amount < 0) {
      spendByCat[t.category] = (spendByCat[t.category] ?? 0) + Math.abs(t.amount);
    }
  }

  // Budget utilisation: 1 when under budget; decreases when overspending
  const cats = Object.keys(budgets) as Category[];
  let utilisationSum = 0;

  for (const c of cats) {
    const budget = budgets[c] || 0;
    const spend = spendByCat[c] ?? 0;
    if (budget <= 0) {
      utilisationSum += 1; // ignore/no budget set -> don’t punish
      continue;
    }
    const ratio = spend / budget;
    const util = ratio <= 1 ? 1 : Math.max(0, 1 - (ratio - 1)); // overspend reduces score
    utilisationSum += util;
  }

  const budgetUtilisation = utilisationSum / cats.length;

  // Weighted score (simple + explainable)
  const score =
    Math.round(
      100 * (0.6 * budgetUtilisation + 0.4 * savingsRate)
    );

  return {
    score: clamp(score, 0, 100),
    savingsRate: clamp01(savingsRate),
    budgetUtilisation: clamp01(budgetUtilisation),
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function clamp01(n: number) {
  return clamp(n, 0, 1);
}
