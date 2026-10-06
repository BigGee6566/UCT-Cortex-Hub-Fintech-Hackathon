import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import {
  applyConsentChoices,
  decodeConsent,
  emptyConsent,
  getConsent,
  grantedScopes,
  hasConsentHistory,
  isConsentActive,
  revokeAllConsent,
  updateConsent,
  withScope,
  type ScopeChoices,
} from '@/services/consent.service';
import { MOCK_TRANSACTIONS } from '@/services/mockFinance';
import { getTransactions } from '@/services/transactions.service';

const T1 = new Date('2026-10-06T10:00:00.000Z');
const T2 = new Date('2026-10-07T12:30:00.000Z');

const choices = (overrides: Partial<ScopeChoices>): ScopeChoices => ({
  'balances:read': false,
  'transactions:read': false,
  'income:read': false,
  'debit_orders:read': false,
  ...overrides,
});

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('decodeConsent migration from version 1', () => {
  it('maps accepted v1 scopes to v2 scope ids, keeping the accepted time', () => {
    const v1 = {
      accepted: true,
      acceptedAt: '2026-01-20T08:00:00.000Z',
      scopes: { balances: true, transactions: true, income: false, debitOrders: true },
    };
    const v2 = decodeConsent(v1);
    expect(v2 && grantedScopes(v2)).toEqual(['balances:read', 'transactions:read', 'debit_orders:read']);
    expect(v2?.scopes['transactions:read'].grantedAt).toBe('2026-01-20T08:00:00.000Z');
  });

  it('grants nothing when v1 consent was declined ("Not now")', () => {
    const v1 = { accepted: false, scopes: { balances: false, transactions: false, income: false, debitOrders: false } };
    const v2 = decodeConsent(v1);
    expect(v2 && isConsentActive(v2)).toBe(false);
  });

  it('a v1 record from storage is migrated by getConsent', async () => {
    await AsyncStorage.setItem(
      'momali.consent',
      JSON.stringify({ accepted: true, scopes: { balances: false, transactions: true, income: false, debitOrders: false } })
    );
    expect(grantedScopes(await getConsent())).toEqual(['transactions:read']);
  });
});

describe('decodeConsent version 2', () => {
  it('only an explicit true grants a scope; junk scope records are not granted', () => {
    const v2 = decodeConsent({
      version: 2,
      scopes: { 'balances:read': { granted: 'yes' }, 'transactions:read': { granted: true, grantedAt: 'x' }, 'income:read': 7 },
    });
    expect(v2 && grantedScopes(v2)).toEqual(['transactions:read']);
  });
});

describe('applyConsentChoices', () => {
  it('stamps grantedAt on new grants and revokedAt on revocations, and keeps unchanged timestamps', () => {
    const first = applyConsentChoices(emptyConsent(), choices({ 'balances:read': true, 'transactions:read': true }), T1);
    expect(first.scopes['balances:read']).toEqual({ granted: true, grantedAt: T1.toISOString() });

    const second = applyConsentChoices(first, choices({ 'balances:read': true }), T2);
    expect(second.scopes['balances:read']).toEqual({ granted: true, grantedAt: T1.toISOString() }); // unchanged
    expect(second.scopes['transactions:read']).toEqual({
      granted: false,
      grantedAt: T1.toISOString(),
      revokedAt: T2.toISOString(),
    });
  });

  it('records history once anything was granted or revoked', () => {
    expect(hasConsentHistory(emptyConsent())).toBe(false);
    const granted = applyConsentChoices(emptyConsent(), choices({ 'income:read': true }), T1);
    expect(hasConsentHistory(granted)).toBe(true);
    const revoked = applyConsentChoices(granted, choices({}), T2);
    expect(isConsentActive(revoked)).toBe(false);
    expect(hasConsentHistory(revoked)).toBe(true);
  });
});

describe('updateConsent / revokeAllConsent', () => {
  it('persists choices and revokes everything', async () => {
    await updateConsent(choices({ 'balances:read': true, 'transactions:read': true }), T1);
    expect(grantedScopes(await getConsent())).toEqual(['balances:read', 'transactions:read']);

    await revokeAllConsent(T2);
    const after = await getConsent();
    expect(isConsentActive(after)).toBe(false);
    expect(after.scopes['transactions:read'].revokedAt).toBe(T2.toISOString());
  });
});

describe('service-layer scope checks', () => {
  it('withScope does not run the read without the scope', async () => {
    let ran = false;
    const result = await withScope('balances:read', () => {
      ran = true;
      return 1;
    });
    expect(result).toEqual({ status: 'consent-required', scope: 'balances:read' });
    expect(ran).toBe(false);
  });

  it('getTransactions requires transactions:read', async () => {
    expect(await getTransactions()).toEqual({ status: 'consent-required', scope: 'transactions:read' });

    await updateConsent(choices({ 'transactions:read': true }), T1);
    expect(await getTransactions()).toEqual({ status: 'ok', data: MOCK_TRANSACTIONS });

    await updateConsent(choices({ 'balances:read': true }), T2); // transactions revoked
    expect((await getTransactions()).status).toBe('consent-required');
  });
});
