// Input rules for the sign-in form. Pure functions, so they are unit-tested directly.

export type LoginErrors = { identifier?: string; secret?: string };

export type LoginResult = { ok: true; userId: string } | { ok: false; errors: LoginErrors };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STUDENT_NUMBER = /^[A-Za-z0-9]{5,20}$/; // institution formats vary, so allow 5-20 letters/digits
const PIN = /^\d{4,8}$/;
const MIN_PASSWORD_LENGTH = 8;

export function validateLogin(identifier: string, secret: string): LoginResult {
  const id = identifier.trim();
  const errors: LoginErrors = {};

  if (!id) {
    errors.identifier = 'Enter your email or student number.';
  } else if (!EMAIL.test(id) && !STUDENT_NUMBER.test(id)) {
    errors.identifier = 'Enter a valid email, or a student number of 5–20 letters or digits.';
  }

  // Up to 8 digits is treated as a PIN; anything else is a password.
  const looksLikePin = /^\d{1,8}$/.test(secret);
  if (!secret) {
    errors.secret = 'Enter your password or PIN.';
  } else if (looksLikePin && !PIN.test(secret)) {
    errors.secret = 'A PIN must be 4–8 digits.';
  } else if (!looksLikePin && secret.length < MIN_PASSWORD_LENGTH) {
    errors.secret = `A password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  if (errors.identifier || errors.secret) return { ok: false, errors };

  // Emails are case-insensitive, so store them lower-case to keep one identity per person.
  return { ok: true, userId: EMAIL.test(id) ? id.toLowerCase() : id };
}
