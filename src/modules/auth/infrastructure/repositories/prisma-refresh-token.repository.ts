import { Injectable } from '@nestjs/common';
import type { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(token: RefreshToken): Promise<void> {
    await this.prisma.refreshToken.upsert({
      where: { id: token.id },
      update: {
        isRevoked: token.isRevoked,
      },
      create: {
        id: token.id,
        token: token.token,
        userId: token.userId,
        isRevoked: token.isRevoked,
        expiresAt: token.expiresAt,
        createdAt: token.createdAt,
      },
    });
  }

  async findByToken(tokenStr: string): Promise<RefreshToken | null> {
    const raw = await this.prisma.refreshToken.findUnique({ where: { token: tokenStr } });
    if (!raw) return null;
    return RefreshToken.create({
      id: raw.id,
      token: raw.token,
      userId: raw.userId,
      isRevoked: raw.isRevoked,
      expiresAt: raw.expiresAt,
      createdAt: raw.createdAt,
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }
}
