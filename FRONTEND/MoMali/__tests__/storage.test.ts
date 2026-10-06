import AsyncStorage from '@react-native-async-storage/async-storage';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { decodeBudgets, getBudgets } from '@/services/budget.service';
import { decodeConsent, emptyConsent, getConsent } from '@/services/consent.service';
import { DEFAULT_BUDGETS } from '@/services/mockFinance';
import { clearAppData, getData, isPlainObject } from '@/services/storage';

const anything = (v: unknown) => v; // decoder that accepts any parsed value

beforeEach(async () => {
  await AsyncStorage.clear();
  // Silence expected warnings and keep them inspectable.
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('getData', () => {
  it('returns the default when the key is missing', async () => {
    expect(await getData('momali.x', 'fallback', anything)).toBe('fallback');
  });

  it('returns the default and deletes the key when JSON is corrupt', async () => {
    await AsyncStorage.setItem('momali.x', '{not json');
    expect(await getData('momali.x', 'fallback', anything)).toBe('fallback');
    expect(await AsyncStorage.getItem('momali.x')).toBeNull();
  });

  it('returns the default and deletes the key when the decoder rejects the shape', async () => {
    await AsyncStorage.setItem('momali.x', '"a string"');
    expect(await getData('momali.x', 'fallback', () => null)).toBe('fallback');
    expect(await AsyncStorage.getItem('momali.x')).toBeNull();
  });

  it('returns the default when the storage read itself fails', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('disk error'));
    expect(await getData('momali.x', 'fallback', anything)).toBe('fallback');
  });

  it('never logs the stored value, only the key', async () => {
    await AsyncStorage.setItem('momali.x', '{"email":"student@example.com"');
    await getData('momali.x', null, anything);
    const logged = JSON.stringify((console.warn as jest.Mock).mock.calls);
    expect(logged).toContain('momali.x');
    expect(logged).not.toContain('student@example.com');
  });
});

describe('clearAppData', () => {
  it('removes Mo’Mali keys and keeps other keys', async () => {
    await AsyncStorage.multiSet([
      ['momali.budgets', '{}'],
      ['momali.consent', '{}'],
      ['other.app', 'keep me'],
    ]);
    await clearAppData();
    expect(await AsyncStorage.getAllKeys()).toEqual(['other.app']);
  });
});

describe('isPlainObject', () => {
  it.each([
    [{}, true],
    [{ a: 1 }, true],
    [null, false],
    [[], false],
    ['x', false],
    [1, false],
  ])('isPlainObject(%p) is %p', (value, expected) => {
    expect(isPlainObject(value)).toBe(expected);
  });
});

describe('decodeBudgets', () => {
  it('rejects non-objects', () => {
    expect(decodeBudgets(null)).toBeNull();
    expect(decodeBudgets([1, 2])).toBeNull();
    expect(decodeBudgets('budgets')).toBeNull();
  });

  it('repairs invalid categories and fills missing ones from defaults', () => {
    const decoded = decodeBudgets({ Food: 999, Transport: 'abc', Rent: -5, Health: Number.NaN, Bogus: 1 });
    expect(decoded).toEqual({ ...DEFAULT_BUDGETS, Food: 999 });
    expect(decoded).not.toHaveProperty('Bogus');
  });

  it('is used by getBudgets so corrupt storage falls back to defaults', async () => {
    await AsyncStorage.setItem('momali.budgets', '{broken');
    expect(await getBudgets()).toEqual(DEFAULT_BUDGETS);
  });
});

describe('decodeConsent (storage safety)', () => {
  it('rejects values that are neither version 2 nor version 1 consent', () => {
    expect(decodeConsent({ scopes: {} })).toBeNull();
    expect(decodeConsent('accepted')).toBeNull();
    expect(decodeConsent(null)).toBeNull();
  });

  it('is used by getConsent so corrupt storage means nothing is granted', async () => {
    await AsyncStorage.setItem('momali.consent', '"oops"');
    expect(await getConsent()).toEqual(emptyConsent());
    expect(await AsyncStorage.getItem('momali.consent')).toBeNull();
  });
});
