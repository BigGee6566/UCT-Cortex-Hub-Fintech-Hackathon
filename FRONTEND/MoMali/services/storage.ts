import AsyncStorage from '@react-native-async-storage/async-storage';

// Every Mo'Mali key starts with this prefix, so "Reset App Data" can find them all.
export const STORAGE_PREFIX = 'momali.';

// Turns a parsed JSON value into a valid T, migrating older shapes where possible.
// Returns null when the value cannot be used.
export type Decoder<T> = (value: unknown) => T | null;

// Reads and validates a stored value. Never throws: missing, unreadable or invalid
// data returns defaultValue. Unusable data is deleted so the app recovers for good.
// Logs name the key only, never the value, because values can hold personal data.
export async function getData<T>(key: string, defaultValue: T, decode: Decoder<T>): Promise<T> {
  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(key);
  } catch (error) {
    console.error(`Storage read failed for key: ${key}`, error);
    return defaultValue;
  }

  if (raw === null) return defaultValue;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.warn(`Discarding unreadable data for key: ${key}`);
    await discard(key);
    return defaultValue;
  }

  const decoded = decode(parsed);
  if (decoded === null) {
    console.warn(`Discarding invalid data for key: ${key}`);
    await discard(key);
    return defaultValue;
  }

  return decoded;
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

// Deletes every Mo'Mali key on this device and leaves other apps' keys alone.
export async function clearAppData(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  await AsyncStorage.multiRemove(keys.filter((k) => k.startsWith(STORAGE_PREFIX)));
}

// True for {...} objects; false for null, arrays and primitives.
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function discard(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // Best effort: the caller already falls back to the default value.
  }
}
