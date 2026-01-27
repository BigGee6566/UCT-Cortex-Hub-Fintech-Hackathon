export type Category =
  | 'Food'
  | 'Transport'
  | 'Data/Airtime'
  | 'Rent'
  | 'Education'
  | 'Health'
  | 'Entertainment'
  | 'Other';

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