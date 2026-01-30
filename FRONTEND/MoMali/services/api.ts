const rawBaseUrl = process.env.EXPO_PUBLIC_API_URL;
const API_BASE_URL = rawBaseUrl?.replace(/\/$/, '') || (__DEV__ ? 'http://localhost:8000' : '');

if (!API_BASE_URL) {
  throw new Error('Missing EXPO_PUBLIC_API_URL environment variable');
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
