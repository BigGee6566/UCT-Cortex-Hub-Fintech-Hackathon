import { Transaction, Category } from '@/types/finance';

export const DEFAULT_BUDGETS: Record<Category, number> = {
  Food: 1200,
  Transport: 800,
  'Data/Airtime': 500,
  Rent: 2500,
  Education: 700,
  Health: 300,
  Entertainment: 400,
  Other: 300,
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '2026-01-02', description: 'NSFAS Allowance', category: 'Other', amount: 2800 },
  { id: 't2', date: '2026-01-03', description: 'Taxi to Campus', category: 'Transport', amount: -28, merchant: 'Taxi' },
  { id: 't3', date: '2026-01-03', description: 'Groceries', category: 'Food', amount: -240, merchant: 'Shoprite' },
  { id: 't4', date: '2026-01-05', description: 'Data Bundle', category: 'Data/Airtime', amount: -120, merchant: 'MTN' },
  { id: 't5', date: '2026-01-06', description: 'Lunch', category: 'Food', amount: -55, merchant: 'Cafeteria' },
  { id: 't6', date: '2026-01-08', description: 'Airtime', category: 'Data/Airtime', amount: -30, merchant: 'Vodacom' },
  { id: 't7', date: '2026-01-10', description: 'Clinic', category: 'Health', amount: -80, merchant: 'Clinic' },
  { id: 't8', date: '2026-01-12', description: 'Movie', category: 'Entertainment', amount: -90, merchant: 'Cinema' },
  { id: 't9', date: '2026-01-14', description: 'Books/Printing', category: 'Education', amount: -160, merchant: 'Campus Print' },
  { id: 't10', date: '2026-01-16', description: 'Rent Contribution', category: 'Rent', amount: -1200, merchant: 'Landlord' },
];
