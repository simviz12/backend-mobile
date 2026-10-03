import { RefreshToken } from './refresh-token.entity';

describe('RefreshToken Entity', () => {
  it('should create and validate properties', () => {
    const token = RefreshToken.create({
      id: '123',
      token: 'token-abc',
      userId: 'user-1',
      isRevoked: false,
      expiresAt: new Date(Date.now() + 1000),
      createdAt: new Date(),
    });

    expect(token.id).toBe('123');
    expect(token.token).toBe('token-abc');
    expect(token.userId).toBe('user-1');
    expect(token.isRevoked).toBe(false);
    expect(token.expiresAt).toBeDefined();
    expect(token.createdAt).toBeDefined();

    expect(token.isValid()).toBe(true);
    expect(token.isExpired()).toBe(false);
  });

  it('should be invalid if revoked or expired', () => {
    const token = RefreshToken.create({
      id: '123',
      token: 'token-abc',
      userId: 'user-1',
      isRevoked: false,
      expiresAt: new Date(Date.now() - 1000), // Expired
      createdAt: new Date(),
    });

    expect(token.isExpired()).toBe(true);
    expect(token.isValid()).toBe(false);

    token.revoke();
    expect(token.isRevoked).toBe(true);
  });
});
