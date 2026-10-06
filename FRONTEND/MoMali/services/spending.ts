import { CATEGORIES, type Category, type Transaction } from '@/types/finance';

// Total spent per category. Expenses are negative amounts; income is ignored.
// Every known category starts at 0 so callers never read undefined.
export function sumExpensesByCategory(txs: Transaction[]): Record<Category, number> {
  const totals = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<Category, number>;

  for (const t of txs) {
    if (t.amount < 0) {
      // `?? 0` keeps the sum a number if data ever carries a category we don't know yet.
      totals[t.category] = (totals[t.category] ?? 0) + Math.abs(t.amount);
    }
  }

  return totals;
}
