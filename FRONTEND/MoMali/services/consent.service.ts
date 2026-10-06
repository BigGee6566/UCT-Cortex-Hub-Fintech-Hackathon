import { getData, isPlainObject, setItem } from '@/services/storage';
import { SCOPES, type ConsentState, type Scope, type ScopeGrant } from '@/types/consent';

const CONSENT_KEY = 'momali.consent';

export type ScopeChoices = Record<Scope, boolean>;

// Result of a consent-gated read: the data, or the permission that is missing.
export type GatedResult<T> = { status: 'ok'; data: T } | { status: 'consent-required'; scope: Scope };

export function emptyConsent(): ConsentState {
  return {
    version: 2,
    scopes: Object.fromEntries(SCOPES.map((s) => [s, { granted: false }])) as Record<Scope, ScopeGrant>,
  };
}

export async function getConsent(): Promise<ConsentState> {
  return getData(CONSENT_KEY, emptyConsent(), decodeConsent);
}

export function hasScope(consent: ConsentState, scope: Scope): boolean {
  return consent.scopes[scope].granted;
}

export function grantedScopes(consent: ConsentState): Scope[] {
  return SCOPES.filter((s) => hasScope(consent, s));
}

export function isConsentActive(consent: ConsentState): boolean {
  return grantedScopes(consent).length > 0;
}

// True once the user has granted or revoked anything, i.e. they have seen the consent screen.
export function hasConsentHistory(consent: ConsentState): boolean {
  return SCOPES.some((s) => consent.scopes[s].granted || consent.scopes[s].revokedAt !== undefined);
}

// Service-layer gate: runs `read` only if `scope` is granted. Every data access goes through this.
export async function withScope<T>(scope: Scope, read: () => T | Promise<T>): Promise<GatedResult<T>> {
  const consent = await getConsent();
  if (!hasScope(consent, scope)) return { status: 'consent-required', scope };
  return { status: 'ok', data: await read() };
}

// Applies the user's choices. Newly granted scopes get grantedAt, newly revoked scopes get
// revokedAt, and unchanged scopes keep their timestamps (a simple on-device audit trail).
export function applyConsentChoices(current: ConsentState, choices: ScopeChoices, now: Date = new Date()): ConsentState {
  const at = now.toISOString();

  const scopes = Object.fromEntries(
    SCOPES.map((s): [Scope, ScopeGrant] => {
      const prev = current.scopes[s];
      if (choices[s] && !prev.granted) return [s, { ...prev, granted: true, grantedAt: at }];
      if (!choices[s] && prev.granted) return [s, { ...prev, granted: false, revokedAt: at }];
      return [s, prev];
    })
  ) as Record<Scope, ScopeGrant>;

  return { version: 2, scopes };
}

export async function updateConsent(choices: ScopeChoices, now: Date = new Date()): Promise<ConsentState> {
  const next = applyConsentChoices(await getConsent(), choices, now);
  await setItem(CONSENT_KEY, next);
  return next;
}

export async function revokeAllConsent(now: Date = new Date()): Promise<ConsentState> {
  const none = Object.fromEntries(SCOPES.map((s) => [s, false])) as ScopeChoices;
  return updateConsent(none, now);
}

// Validates stored consent and migrates version 1. Anything unusable means "nothing granted",
// the safe default for a permission. Only an explicit `true` grants a scope.
export function decodeConsent(value: unknown): ConsentState | null {
  if (!isPlainObject(value)) return null;

  if (value.version === 2) {
    if (!isPlainObject(value.scopes)) return null;
    const stored = value.scopes;
    return {
      version: 2,
      scopes: Object.fromEntries(SCOPES.map((s) => [s, decodeGrant(stored[s])])) as Record<Scope, ScopeGrant>,
    };
  }

  // Version 1: { accepted, acceptedAt, scopes: { balances, transactions, income, debitOrders } }
  if (typeof value.accepted === 'boolean') {
    const old = isPlainObject(value.scopes) ? value.scopes : {};
    const acceptedAt = typeof value.acceptedAt === 'string' ? value.acceptedAt : undefined;
    const legacy: Record<Scope, unknown> = {
      'balances:read': old.balances,
      'transactions:read': old.transactions,
      'income:read': old.income,
      'debit_orders:read': old.debitOrders,
    };
    return {
      version: 2,
      scopes: Object.fromEntries(
        SCOPES.map((s) => [s, value.accepted === true && legacy[s] === true ? { granted: true, grantedAt: acceptedAt } : { granted: false }])
      ) as Record<Scope, ScopeGrant>,
    };
  }

  return null;
}

function decodeGrant(value: unknown): ScopeGrant {
  if (!isPlainObject(value)) return { granted: false };
  return {
    granted: value.granted === true,
    grantedAt: typeof value.grantedAt === 'string' ? value.grantedAt : undefined,
    revokedAt: typeof value.revokedAt === 'string' ? value.revokedAt : undefined,
  };
}
