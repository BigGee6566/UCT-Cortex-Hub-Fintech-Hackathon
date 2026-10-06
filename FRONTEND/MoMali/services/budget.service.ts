import { getData, isPlainObject, setItem } from '@/services/storage';
import { DEFAULT_BUDGETS } from '@/services/mockFinance';
import { sumExpensesByCategory } from '@/services/spending';
import { CATEGORIES, type Budgets, type Category, type Transaction } from '@/types/finance';

const BUDGET_KEY = 'momali.budgets';

// Highest monthly limit the editor accepts; catches typos such as an extra zero run.
export const MAX_BUDGET = 1_000_000;

// One row of the Budgets screen.
export type BudgetCategory = {
  category: Category;
  limit: number;
  spent: number;
  percentUsed: number | null; // spent / limit; null when no limit is set (limit 0)
};

export type BudgetFormErrors = Partial<Record<Category, string>>;

export type BudgetFormResult =
  | { ok: true; budgets: Budgets }
  | { ok: false; errors: BudgetFormErrors };

export async function getBudgets(): Promise<Budgets> {
  return getData(BUDGET_KEY, DEFAULT_BUDGETS, decodeBudgets);
}

export async function saveBudgets(budgets: Budgets): Promise<void> {
  await setItem(BUDGET_KEY, budgets);
}

// Validates stored budgets. A missing or invalid category falls back to its default,
// which also migrates data saved before a category existed. Unknown keys are dropped.
export function decodeBudgets(value: unknown): Budgets | null {
  if (!isPlainObject(value)) return null;

  return Object.fromEntries(
    CATEGORIES.map((category) => {
      const v = value[category];
      const valid = typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= MAX_BUDGET;
      return [category, valid ? v : DEFAULT_BUDGETS[category]];
    })
  ) as Budgets;
}

// Combines limits with spending from transactions, in the fixed category order.
export function buildBudgetRows(budgets: Budgets, txs: Transaction[]): BudgetCategory[] {
  const spent = sumExpensesByCategory(txs);

  return CATEGORIES.map((category) => {
    const limit = budgets[category] ?? 0;
    return {
      category,
      limit,
      spent: spent[category],
      percentUsed: limit > 0 ? spent[category] / limit : null,
    };
  });
}

// Validates the edit form. Accepts "1200", "1 200", "1200.50" and "1200,50".
// Rejects blanks, negatives, more than 2 decimals and thousands commas ("1,200"),
// because "1,200" could mean R1 200 or R1.20.
export function parseBudgetInputs(inputs: Record<Category, string>): BudgetFormResult {
  const budgets = {} as Budgets;
  const errors: BudgetFormErrors = {};

  for (const category of CATEGORIES) {
    const text = (inputs[category] ?? '').replace(/\s/g, '').replace(',', '.');

    if (!/^\d+(\.\d{1,2})?$/.test(text)) {
      errors[category] = 'Enter an amount in rand using digits only, e.g. 1200 or 1200.50 (0 means no limit).';
      continue;
    }

    const value = Number(text);
    if (value > MAX_BUDGET) {
      errors[category] = 'Enter R1 000 000 or less.';
      continue;
    }

    budgets[category] = value;
  }

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, budgets };
}
