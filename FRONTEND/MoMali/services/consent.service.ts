import { getItem, setItem } from '@/services/storage';
import { ConsentState } from '@/types/consent';

const CONSENT_KEY = 'momali.consent';

export async function getConsent(): Promise<ConsentState | null> {
  return getItem<ConsentState>(CONSENT_KEY);
}

export async function saveConsent(consent: ConsentState): Promise<void> {
  await setItem(CONSENT_KEY, consent);
}
