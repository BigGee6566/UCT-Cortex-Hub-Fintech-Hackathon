import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import {
  MAX_BUDGET,
  buildBudgetRows,
  getBudgets,
  parseBudgetInputs,
  saveBudgets,
} from '@/services/budget.service';
import { DEFAULT_BUDGETS, MOCK_TRANSACTIONS } from '@/services/mockFinance';
import { sumExpensesByCategory } from '@/services/spending';
import { CATEGORIES, type Category, type Transaction } from '@/types/finance';

// Form values with every category set to the same text, then overridden per test.
function form(overrides: Partial<Record<Category, string>> = {}): Record<Category, string> {
  return { ...(Object.fromEntries(CATEGORIES.map((c) => [c, '100'])) as Record<Category, string>), ...overrides };
}

describe('sumExpensesByCategory', () => {
  it('sums expenses per category and ignores income', () => {
    const totals = sumExpensesByCategory(MOCK_TRANSACTIONS);
    expect(totals.Food).toBe(295); // 240 groceries + 55 lunch
    expect(totals['Data/Airtime']).toBe(150); // 120 + 30
    expect(totals.Other).toBe(0); // the NSFAS allowance in "Other" is income
  });

  it('starts every category at 0', () => {
    expect(sumExpensesByCategory([])).toEqual(Object.fromEntries(CATEGORIES.map((c) => [c, 0])));
  });
});

describe('buildBudgetRows', () => {
  it('returns one row per category in the fixed order', () => {
    const rows = buildBudgetRows(DEFAULT_BUDGETS, MOCK_TRANSACTIONS);
    expect(rows.map((r) => r.category)).toEqual([...CATEGORIES]);

    const food = rows.find((r) => r.category === 'Food');
    expect(food).toEqual({ category: 'Food', limit: 1200, spent: 295, percentUsed: 295 / 1200 });
  });

  it('marks a category with limit 0 as having no limit', () => {
    const rows = buildBudgetRows({ ...DEFAULT_BUDGETS, Food: 0 }, MOCK_TRANSACTIONS);
    expect(rows.find((r) => r.category === 'Food')?.percentUsed).toBeNull();
  });

  it('reports more than 100% when spending exceeds the limit', () => {
    const txs: Transaction[] = [{ id: 'x', date: '2026-01-01', description: 'Taxi', category: 'Transport', amount: -150 }];
    const rows = buildBudgetRows({ ...DEFAULT_BUDGETS, Transport: 100 }, txs);
    expect(rows.find((r) => r.category === 'Transport')?.percentUsed).toBe(1.5);
  });
});

describe('parseBudgetInputs', () => {
  it('accepts plain, spaced and decimal amounts', () => {
    const result = parseBudgetInputs(form({ Food: '1 200', Transport: '800.5', Rent: '2500,75', Other: '0' }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.budgets.Food).toBe(1200);
      expect(result.budgets.Transport).toBe(800.5);
      expect(result.budgets.Rent).toBe(2500.75);
      expect(result.budgets.Other).toBe(0);
    }
  });

  it.each([
    ['blank', ''],
    ['letters', 'abc'],
    ['negative', '-50'],
    ['three decimals', '12.345'],
    ['thousands comma', '1,200'],
  ])('rejects %s input', (_label, text) => {
    const result = parseBudgetInputs(form({ Food: text }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors)).toEqual(['Food']); // only the bad field is flagged
    }
  });

  it('rejects amounts above the maximum', () => {
    const result = parseBudgetInputs(form({ Health: String(MAX_BUDGET + 1) }));
    expect(result.ok).toBe(false);
  });
});

describe('getBudgets / saveBudgets', () => {
  beforeEach(async () => {
    await AsyncStorage.clear(); // each test starts with empty storage
  });

  it('returns defaults when nothing is saved, then the saved values', async () => {
    expect(await getBudgets()).toEqual(DEFAULT_BUDGETS);

    const updated = { ...DEFAULT_BUDGETS, Food: 999 };
    await saveBudgets(updated);
    expect(await getBudgets()).toEqual(updated);
  });
});
