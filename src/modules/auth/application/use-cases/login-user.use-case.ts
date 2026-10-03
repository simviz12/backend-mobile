import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginUserDto } from '../dtos/login-user.dto';
import { Email } from '../../../users/domain/value-objects/email.value-object';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { REFRESH_TOKEN_REPOSITORY } from '../../domain/repositories/refresh-token.repository.interface';
import type { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { v4 as uuidv4 } from 'uuid';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginUserDto): Promise<LoginResponse> {
    let email: Email;
    try {
      email = Email.create(dto.email);
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await user.password.compare(dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email.value };
    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });

    const refreshTokenStr = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const refreshToken = RefreshToken.create({
      id: uuidv4(),
      token: refreshTokenStr,
      userId: user.id,
      isRevoked: false,
      expiresAt,
      createdAt: new Date(),
    });

    await this.refreshTokenRepository.save(refreshToken);

    return {
      accessToken,
      refreshToken: refreshTokenStr,
    };
  }
}
