import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginUserDto } from '../dtos/login-user.dto';
import { Email } from '../../../users/domain/value-objects/email.value-object';
import { IUserRepository, USER_REPOSITORY } from '../../../users/domain/repositories/user.repository.interface';

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: LoginUserDto): Promise<{ id: string; email: string }> {
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

    // Usually we generate and return JWT here, but that is Day 3 task.
    // For now we just return the user id and email.
    return {
      id: user.id,
      email: user.email.value,
    };
  }
}
