export const PASSWORD_MIN_LENGTH = 8;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SPECIAL_CHAR_PATTERN = /[^A-Za-z0-9]/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmailFormat(email: string): boolean {
  return EMAIL_PATTERN.test(normalizeEmail(email));
}

export function getPasswordValidationErrors(password: string): string[] {
  const issues: string[] = [];

  if (password.length < PASSWORD_MIN_LENGTH) {
    issues.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`);
  }

  if (!SPECIAL_CHAR_PATTERN.test(password)) {
    issues.push('Password must include at least one special character.');
  }

  return issues;
}

export function getSignUpValidationError(email: string, password: string): string | null {
  if (!isValidEmailFormat(email)) {
    return 'Please enter a valid email address.';
  }

  const passwordErrors = getPasswordValidationErrors(password);
  if (passwordErrors.length > 0) {
    return passwordErrors[0];
  }

  return null;
}
