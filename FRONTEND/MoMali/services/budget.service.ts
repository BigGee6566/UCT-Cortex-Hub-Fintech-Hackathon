import { getItem, setItem } from '@/services/storage';
import { DEFAULT_BUDGETS } from '@/services/mockFinance';
import type { Category } from '@/types/finance';

const BUDGET_KEY = 'momali.budgets';

export async function getBudgets(): Promise<Record<Category, number>> {
  const existing = await getItem<Record<Category, number>>(BUDGET_KEY);
  return existing ?? DEFAULT_BUDGETS;
}

export async function saveBudgets(budgets: Record<Category, number>): Promise<void> {
  await setItem(BUDGET_KEY, budgets);
}
