import { getItem, setItem } from '@/services/storage';
import type { QuestionnaireAnswers, IncomeSourceKey } from '@/types/questionnaire';

const KEY = 'momali.questionnaire';

export function defaultQuestionnaire(): QuestionnaireAnswers {
  const incomeSources: Record<IncomeSourceKey, any> = {
    Salary: { enabled: false, amount: 0, frequency: 'Monthly' },
    NSFAS: { enabled: true, amount: 0, frequency: 'Monthly' },
    'Family Support': { enabled: false, amount: 0, frequency: 'Monthly' },
    'Hustle / Business': { enabled: false, amount: 0, frequency: 'Weekly' },
    Scholarship: { enabled: false, amount: 0, frequency: 'Monthly' },
    Other: { enabled: false, amount: 0, frequency: 'Monthly' },
  };

  return {
    step1: {
      employmentStatus: 'Student',
      monthlyIncome: 0,
      incomeSources,
    },
    step2: { bills: [] },
    step3: {
      spendCategories: {
        Food: { budget: 0 },
        Transport: { budget: 0 },
        'Data/Airtime': { budget: 0 },
        Rent: { budget: 0 },
        Education: { budget: 0 },
        Entertainment: { budget: 0 },
        Other: { budget: 0 },
      },
    },
    step4: {
      biggestChallenges: [],
      goals: [],
    },
  };
}

function normalizeQuestionnaire(data: QuestionnaireAnswers | null): QuestionnaireAnswers {
  const fallback = defaultQuestionnaire();
  if (!data) return fallback;

  const anyData = data as any;
  const biggestChallenges: string[] =
    Array.isArray(anyData.step4?.biggestChallenges) ? anyData.step4.biggestChallenges : [];
  const goals: string[] = Array.isArray(anyData.step4?.goals) ? anyData.step4.goals : [];

  if (anyData.step4?.biggestChallenge) biggestChallenges.push(anyData.step4.biggestChallenge);
  if (anyData.step4?.goal) goals.push(anyData.step4.goal);

  return {
    ...fallback,
    ...data,
    step4: {
      biggestChallenges,
      goals,
    },
  };
}

export async function getQuestionnaire(): Promise<QuestionnaireAnswers> {
  const stored = await getItem<QuestionnaireAnswers>(KEY);
  return normalizeQuestionnaire(stored ?? null);
}

export async function saveQuestionnaire(data: QuestionnaireAnswers): Promise<void> {
  await setItem(KEY, data);
}

export async function patchQuestionnaire(
  patch: Partial<QuestionnaireAnswers>
): Promise<QuestionnaireAnswers> {
  const current = await getQuestionnaire();
  const merged = { ...current, ...patch };
  await saveQuestionnaire(merged);
  return merged;
}
