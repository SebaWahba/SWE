import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authApi } from './api';

class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string) {
    this.store[key] = value;
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

const makeResponse = (ok: boolean, body: any) => {
  return {
    ok,
    json: async () => body,
  } as Response;
};

describe('auth api client', () => {
  const storage = new LocalStorageMock();
  const fetchMock = vi.fn();

  beforeEach(() => {
    storage.clear();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('localStorage', storage as unknown as Storage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('signUp posts user credentials and return origin', async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(true, { message: 'ok' }));

    await authApi.signUp('viewer@example.com', 'Password!1', 'Viewer');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, requestInit] = fetchMock.mock.calls[0];
    expect(url).toContain('/auth/signup');

    const requestBody = JSON.parse(requestInit.body as string);
    expect(requestBody.email).toBe('viewer@example.com');
    expect(requestBody.password).toBe('Password!1');
    expect(requestBody.name).toBe('Viewer');
    expect(requestBody.returnOrigin).toBe('');
  });

  it('signUp does not persist an access token before verification', async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(true, { message: 'created' }));

    await authApi.signUp('viewer@example.com', 'Password!1');

    expect(localStorage.getItem('loopy_access_token')).toBeNull();
  });

  it('signUp throws API error message for duplicate email', async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(false, { error: 'This email address is already in use.' }));

    await expect(authApi.signUp('viewer@example.com', 'Password!1')).rejects.toThrow(
      'This email address is already in use.',
    );
  });

  it('signIn stores access token on successful login', async () => {
    fetchMock.mockResolvedValueOnce(
      makeResponse(true, { session: { access_token: 'token-123' }, user: { id: 'u1' } }),
    );

    await authApi.signIn('viewer@example.com', 'Password!1');

    expect(localStorage.getItem('loopy_access_token')).toBe('token-123');
  });

  it('resendVerificationEmail calls resend endpoint', async () => {
    fetchMock.mockResolvedValueOnce(
      makeResponse(true, { message: 'A new verification link has been sent.' }),
    );

    const result = await authApi.resendVerificationEmail('viewer@example.com');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/auth/resend-verification');
    expect(result.message).toContain('verification link');
  });

  it('getVerificationStatus calls verification status endpoint', async () => {
    fetchMock.mockResolvedValueOnce(
      makeResponse(true, { email: 'viewer@example.com', exists: true, provider: 'email', emailVerified: false }),
    );

    const result = await authApi.getVerificationStatus('viewer@example.com');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/auth/verification-status');
    expect(result.exists).toBe(true);
    expect(result.emailVerified).toBe(false);
  });
});
