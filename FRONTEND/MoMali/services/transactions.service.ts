import { withScope, type GatedResult } from '@/services/consent.service';
import { MOCK_TRANSACTIONS } from '@/services/mockFinance';
import type { Transaction } from '@/types/finance';

// Transaction history. Demo data until real bank connections exist.
// Requires the transactions:read permission; screens must handle 'consent-required'.
export async function getTransactions(): Promise<GatedResult<Transaction[]>> {
  return withScope('transactions:read', () => MOCK_TRANSACTIONS);
}
