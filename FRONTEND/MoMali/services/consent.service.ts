import { getData, isPlainObject, setItem } from '@/services/storage';
import { ConsentState } from '@/types/consent';

const CONSENT_KEY = 'momali.consent';

export async function getConsent(): Promise<ConsentState | null> {
  return getData<ConsentState | null>(CONSENT_KEY, null, decodeConsent);
}

export async function saveConsent(consent: ConsentState): Promise<void> {
  await setItem(CONSENT_KEY, consent);
}

// Validates stored consent. Anything unusable is treated as "not connected",
// the safe default for a permission. Missing scope flags count as not granted.
export function decodeConsent(value: unknown): ConsentState | null {
  if (!isPlainObject(value) || typeof value.accepted !== 'boolean') return null;

  const scopes = isPlainObject(value.scopes) ? value.scopes : {};
  const flag = (v: unknown) => v === true; // only an explicit true grants a scope

  return {
    accepted: value.accepted,
    acceptedAt: typeof value.acceptedAt === 'string' ? value.acceptedAt : undefined,
    scopes: {
      balances: flag(scopes.balances),
      transactions: flag(scopes.transactions),
      income: flag(scopes.income),
      debitOrders: flag(scopes.debitOrders),
    },
  };
}
