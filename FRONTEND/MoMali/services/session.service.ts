import { getData, isPlainObject, removeItem, setItem } from '@/services/storage';

const SESSION_KEY = 'momali.session';

// Device-local sign-in state. There is no server yet, so this only gates the UI on
// this device; it is not authentication. The password or PIN is never stored.
export type Session = {
  isLoggedIn: true;
  userId: string;
  signedInAt: string; // ISO timestamp
};

export async function getSession(): Promise<Session | null> {
  return getData<Session | null>(SESSION_KEY, null, decodeSession);
}

export async function saveSession(userId: string, now: Date = new Date()): Promise<Session> {
  const session: Session = { isLoggedIn: true, userId, signedInAt: now.toISOString() };
  await setItem(SESSION_KEY, session);
  return session;
}

export async function clearSession(): Promise<void> {
  await removeItem(SESSION_KEY);
}

// Only a well-formed signed-in record counts; anything else means signed out.
export function decodeSession(value: unknown): Session | null {
  if (!isPlainObject(value) || value.isLoggedIn !== true) return null;
  if (typeof value.userId !== 'string' || value.userId.trim() === '') return null;

  return {
    isLoggedIn: true,
    userId: value.userId,
    signedInAt: typeof value.signedInAt === 'string' ? value.signedInAt : '',
  };
}
