import { jest } from '@jest/globals';
import { LogoutUseCase } from './logout.use-case';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let mockRefreshTokenRepository: any;

  beforeEach(() => {
    mockRefreshTokenRepository = {
      revokeAllForUser: jest.fn(),
    };
    useCase = new LogoutUseCase(mockRefreshTokenRepository);
  });

  it('should revoke all tokens for user', async () => {
    await useCase.execute('user-1');
    expect(mockRefreshTokenRepository.revokeAllForUser).toHaveBeenCalledWith('user-1');
  });
});
