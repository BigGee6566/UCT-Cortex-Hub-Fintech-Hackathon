// Ordered list of spending categories. Screens iterate over it and storage
// validation uses it to reject unknown or missing categories.
export const CATEGORIES = [
  'Food',
  'Transport',
  'Data/Airtime',
  'Rent',
  'Education',
  'Health',
  'Entertainment',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

// Monthly spending limit per category, in rand.
export type Budgets = Record<Category, number>;

export type Transaction = {
  id: string;
  date: string; // ISO date (YYYY-MM-DD)
  description: string;
  category: Category;
  amount: number; // negative = expense, positive = income
  merchant?: string;
};

export type FinanceSummary = {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  expensesByCategory: Record<Category, number>;
};
