import { apiFetch } from '@/services/api';

export type SendVerificationCodeResponse = {
  masked_email: string;
  expires_in_seconds: number;
};

export type VerifyCodeResponse = {
  verified: boolean;
};

export async function sendVerificationCode(email: string): Promise<SendVerificationCodeResponse> {
  return apiFetch<SendVerificationCodeResponse>('/auth/send-verification-code', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function verifyEmailCode(email: string, code: string): Promise<VerifyCodeResponse> {
  return apiFetch<VerifyCodeResponse>('/auth/verify-code', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
}
