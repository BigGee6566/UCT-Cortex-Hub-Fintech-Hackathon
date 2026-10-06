import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { validateLogin } from '@/services/login.validation';
import { clearSession, decodeSession, getSession, saveSession } from '@/services/session.service';

describe('validateLogin', () => {
  it.each([
    ['an email and password', 'Student@Example.com', 'longenough', 'student@example.com'],
    ['a student number and PIN', '201912345', '1234', '201912345'],
    ['an alphanumeric student number and 8-digit PIN', 'WSU2024ab', '12345678', 'WSU2024ab'],
    ['a 9+ digit numeric password', 'me@uni.ac.za', '123456789', 'me@uni.ac.za'],
    ['surrounding spaces in the identifier', '  me@uni.ac.za  ', 'longenough', 'me@uni.ac.za'],
  ])('accepts %s', (_label, identifier, secret, expectedUserId) => {
    expect(validateLogin(identifier, secret)).toEqual({ ok: true, userId: expectedUserId });
  });

  it.each([
    ['an empty identifier', '', 'longenough', 'identifier'],
    ['a malformed email', 'me@uni', 'longenough', 'identifier'],
    ['a too-short student number', '1234', 'longenough', 'identifier'],
    ['a student number with symbols', '2019-123', 'longenough', 'identifier'],
    ['an empty secret', 'me@uni.ac.za', '', 'secret'],
    ['a 3-digit PIN', 'me@uni.ac.za', '123', 'secret'],
    ['a short password', 'me@uni.ac.za', 'short', 'secret'],
  ])('rejects %s', (_label, identifier, secret, field) => {
    const result = validateLogin(identifier, secret);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.errors).filter((k) => result.errors[k as 'identifier' | 'secret'])).toEqual([field]);
  });
});

describe('session storage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('starts signed out, saves a session, then clears it', async () => {
    expect(await getSession()).toBeNull();

    const saved = await saveSession('me@uni.ac.za', new Date('2026-10-06T10:00:00.000Z'));
    expect(saved).toEqual({ isLoggedIn: true, userId: 'me@uni.ac.za', signedInAt: '2026-10-06T10:00:00.000Z' });
    expect(await getSession()).toEqual(saved);

    await clearSession();
    expect(await getSession()).toBeNull();
  });

  it('never stores the password or PIN', async () => {
    await saveSession('me@uni.ac.za');
    const raw = await AsyncStorage.getItem('momali.session');
    expect(Object.keys(JSON.parse(raw ?? '{}')).sort()).toEqual(['isLoggedIn', 'signedInAt', 'userId']);
  });
});

describe('decodeSession', () => {
  it.each([
    ['null', null],
    ['a bare boolean', true],
    ['isLoggedIn false', { isLoggedIn: false, userId: 'x1234' }],
    ['a missing userId', { isLoggedIn: true }],
    ['a blank userId', { isLoggedIn: true, userId: '   ' }],
  ])('treats %s as signed out', (_label, value) => {
    expect(decodeSession(value)).toBeNull();
  });
});
