import { apiFetch, getApiBaseUrl } from '@/services/api';

export type ConsentCreateResponse = {
  id: string;
  user_id: string;
  consent_id: string;
  status: string;
  authorization_url?: string | null;
  expires_at?: string | null;
};

export type ConsentStatusResponse = {
  id: string;
  user_id: string;
  consent_id: string;
  status: string;
  expires_at?: string | null;
  authorized_at?: string | null;
  revoked_at?: string | null;
};

export async function createConsent(params: {
  userExternalId: string;
  email?: string;
  scopes?: string[];
}): Promise<ConsentCreateResponse> {
  const redirectUri = `${getApiBaseUrl()}/open-banking/authorize/callback`;

  return apiFetch<ConsentCreateResponse>('/open-banking/consents', {
    method: 'POST',
    body: JSON.stringify({
      user_external_id: params.userExternalId,
      email: params.email,
      redirect_uri: redirectUri,
      scopes: params.scopes,
    }),
  });
}

export async function getConsentStatus(consentId: string): Promise<ConsentStatusResponse> {
  return apiFetch<ConsentStatusResponse>(`/open-banking/consents/${consentId}`);
}

export async function exchangeConsentToken(consentId: string) {
  const redirectUri = `${getApiBaseUrl()}/open-banking/authorize/callback`;
  return apiFetch('/open-banking/authorize/callback', {
    method: 'POST',
    body: JSON.stringify({ consent_id: consentId, redirect_uri: redirectUri }),
  });
}

export async function refreshToken(userId: string, consentId: string) {
  return apiFetch('/open-banking/tokens/refresh', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, consent_id: consentId }),
  });
}

export async function syncAccounts(userId: string, consentId: string) {
  return apiFetch('/open-banking/sync/accounts', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, consent_id: consentId }),
  });
}

export async function syncBalances(userId: string, consentId: string) {
  return apiFetch('/open-banking/sync/balances', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, consent_id: consentId }),
  });
}

export async function syncTransactions(userId: string, consentId: string) {
  return apiFetch('/open-banking/sync/transactions', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, consent_id: consentId }),
  });
}
