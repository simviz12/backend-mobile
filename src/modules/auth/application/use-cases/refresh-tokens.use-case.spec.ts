import { jest } from '@jest/globals';
import { RefreshTokensUseCase } from './refresh-tokens.use-case';
import { UnauthorizedException } from '@nestjs/common';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';

describe('RefreshTokensUseCase', () => {
  let useCase: RefreshTokensUseCase;
  let mockUserRepository: any;
  let mockRefreshTokenRepository: any;
  let mockJwtService: any;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
    };
    mockRefreshTokenRepository = {
      findByToken: jest.fn(),
      save: jest.fn(),
      revokeAllForUser: jest.fn(),
    };
    mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('new-access-token'),
    };
    useCase = new RefreshTokensUseCase(
      mockUserRepository,
      mockRefreshTokenRepository,
      mockJwtService,
    );
  });

  it('should throw UnauthorizedException if token not found', async () => {
    mockRefreshTokenRepository.findByToken.mockResolvedValue(null);
    await expect(useCase.execute('invalid-token')).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException and revoke all if token is revoked', async () => {
    const token = RefreshToken.create({
      id: '1',
      token: 'revoked-token',
      userId: 'user-1',
      isRevoked: true,
      expiresAt: new Date(Date.now() + 10000),
      createdAt: new Date(),
    });
    mockRefreshTokenRepository.findByToken.mockResolvedValue(token);

    await expect(useCase.execute('revoked-token')).rejects.toThrow(UnauthorizedException);
    expect(mockRefreshTokenRepository.revokeAllForUser).toHaveBeenCalledWith('user-1');
  });

  it('should throw UnauthorizedException if token is expired', async () => {
    const token = RefreshToken.create({
      id: '1',
      token: 'expired-token',
      userId: 'user-1',
      isRevoked: false,
      expiresAt: new Date(Date.now() - 10000),
      createdAt: new Date(),
    });
    mockRefreshTokenRepository.findByToken.mockResolvedValue(token);

    await expect(useCase.execute('expired-token')).rejects.toThrow(UnauthorizedException);
  });
});
