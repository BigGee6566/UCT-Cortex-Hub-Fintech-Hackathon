import { getItem, setItem } from '@/services/storage';

export type AppProgress =
  | 'AUTH'
  | 'QUESTIONNAIRE'
  | 'CONSENT'
  | 'BANK_CONNECTION'
  | 'DASHBOARD';

export type AppState = {
  isAuthed: boolean;
  progress: AppProgress;
};

const KEY = 'momali.appState';

export async function getAppState(): Promise<AppState> {
  const saved = await getItem<AppState>(KEY);
  return (
    saved ?? {
      isAuthed: false,
      progress: 'AUTH',
    }
  );
}

export async function setAppState(patch: Partial<AppState>): Promise<void> {
  const current = await getAppState();
  await setItem(KEY, { ...current, ...patch });
}

export async function resetAppState(): Promise<void> {
  await setItem(KEY, { isAuthed: false, progress: 'AUTH' });
}
