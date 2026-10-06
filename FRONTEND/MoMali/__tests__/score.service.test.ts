import { describe, expect, it } from '@jest/globals';

import { DEFAULT_BUDGETS, MOCK_TRANSACTIONS } from '@/services/mockFinance';
import { computeHealthScore } from '@/services/score.service';

describe('computeHealthScore', () => {
  it('scores the demo data at 71, the value the Dashboard shows today', () => {
    // Income 2800, expenses 2003, every category under budget:
    // round(100 * (0.6 * 1 + 0.4 * 797 / 2800)) = 71
    const result = computeHealthScore(MOCK_TRANSACTIONS, DEFAULT_BUDGETS);

    expect(result.score).toBe(71);
    expect(result.budgetUtilisation).toBe(1);
    expect(result.savingsRate).toBeCloseTo(797 / 2800, 10);
  });
});
