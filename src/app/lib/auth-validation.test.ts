import { describe, expect, it } from 'vitest';
import {
  PASSWORD_MIN_LENGTH,
  getPasswordValidationErrors,
  getSignUpValidationError,
  isValidEmailFormat,
  normalizeEmail,
} from './auth-validation';

describe('auth validation rules', () => {
  it('normalizes email by trimming and lowercasing', () => {
    expect(normalizeEmail('  Viewer@Example.COM  ')).toBe('viewer@example.com');
  });

  it('accepts a valid email format', () => {
    expect(isValidEmailFormat('viewer@example.com')).toBe(true);
  });

  it('rejects emails without @ symbol', () => {
    expect(isValidEmailFormat('viewer.example.com')).toBe(false);
  });

  it('rejects emails without top-level domain', () => {
    expect(isValidEmailFormat('viewer@example')).toBe(false);
  });

  it('returns two password errors when too short and missing special character', () => {
    const errors = getPasswordValidationErrors('weak1');

    expect(errors).toHaveLength(2);
    expect(errors[0]).toContain(String(PASSWORD_MIN_LENGTH));
    expect(errors[1]).toContain('special character');
  });

  it('returns one password error when special character is missing', () => {
    const errors = getPasswordValidationErrors('longpassword1');

    expect(errors).toEqual(['Password must include at least one special character.']);
  });

  it('returns no password errors when policy is satisfied', () => {
    const errors = getPasswordValidationErrors('StrongPass!1');
    expect(errors).toEqual([]);
  });

  it('returns email validation message before password validation', () => {
    const error = getSignUpValidationError('invalid-email', 'weak');
    expect(error).toBe('Please enter a valid email address.');
  });

  it('returns password validation message for weak password', () => {
    const error = getSignUpValidationError('viewer@example.com', 'Password1');
    expect(error).toBe('Password must include at least one special character.');
  });

  it('returns null when both email and password are valid', () => {
    const error = getSignUpValidationError('viewer@example.com', 'Password!1');
    expect(error).toBeNull();
  });
});
