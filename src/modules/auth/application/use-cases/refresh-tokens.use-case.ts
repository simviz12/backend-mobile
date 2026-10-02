import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { REFRESH_TOKEN_REPOSITORY } from '../../domain/repositories/refresh-token.repository.interface';
import type { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { v4 as uuidv4 } from 'uuid';

export interface RefreshTokensResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class RefreshTokensUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(refreshTokenStr: string): Promise<RefreshTokensResponse> {
    const token = await this.refreshTokenRepository.findByToken(refreshTokenStr);

    if (!token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!token.isValid()) {
      if (token.isRevoked) {
        // Reuse detection: revoke all tokens for this user
        await this.refreshTokenRepository.revokeAllForUser(token.userId);
      }
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Revoke current token (rotation)
    token.revoke();
    await this.refreshTokenRepository.save(token);

    const user = await this.userRepository.findById(token.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Issue new tokens
    const payload = { sub: user.id, email: user.email.value };
    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });

    const newRefreshTokenStr = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const newRefreshToken = RefreshToken.create({
      id: uuidv4(),
      token: newRefreshTokenStr,
      userId: user.id,
      isRevoked: false,
      expiresAt,
      createdAt: new Date(),
    });

    await this.refreshTokenRepository.save(newRefreshToken);

    return {
      accessToken,
      refreshToken: newRefreshTokenStr,
    };
  }
}
