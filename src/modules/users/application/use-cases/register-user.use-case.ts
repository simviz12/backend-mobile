import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { Email } from '../../domain/value-objects/email.value-object';
import { Password } from '../../domain/value-objects/password.value-object';
import { User } from '../../domain/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: RegisterUserDto): Promise<{ id: string; email: string }> {
    const email = Email.create(dto.email);

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const password = await Password.create(dto.password);

    const user = User.create({
      id: uuidv4(),
      email,
      password,
      createdAt: new Date(),
    });

    await this.userRepository.save(user);

    return {
      id: user.id,
      email: user.email.value,
    };
  }
}
