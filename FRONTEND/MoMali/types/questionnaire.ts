export type Frequency = 'Daily' | 'Weekly' | 'Monthly';

export type IncomeSourceKey =
  | 'Salary'
  | 'NSFAS'
  | 'Family Support'
  | 'Hustle / Business'
  | 'Scholarship'
  | 'Other';

export type IncomeSourceAnswer = {
  enabled: boolean;
  amount: number;
  frequency: Frequency;
};

export type BillItem = {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
};

export type QuestionnaireAnswers = {
  step1: {
    employmentStatus: 'Student' | 'Employed' | 'Self-employed' | 'Unemployed' | 'Other';
    monthlyIncome: number;
    incomeSources: Record<IncomeSourceKey, IncomeSourceAnswer>;
  };
  step2: {
    bills: BillItem[];
  };
  step3: {
    spendCategories: Record<
      'Food' | 'Transport' | 'Data/Airtime' | 'Rent' | 'Education' | 'Entertainment' | 'Other',
      { budget: number }
    >;
  };
  step4: {
    biggestChallenges: Array<
      | 'Overspending'
      | 'No budget'
      | 'Debt / Loans'
      | 'Impulse buying'
      | 'Irregular income'
      | 'Too many subscriptions'
      | 'Other'
    >;
    goals: Array<'Save' | 'Pay debt' | 'Budget better' | 'Build credit' | 'Emergency fund'>;
  };
};
