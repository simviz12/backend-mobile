import { LoginUserUseCase } from './login-user.use-case';
import { IUserRepository } from '../../users/domain/repositories/user.repository.interface';
import { LoginUserDto } from '../dtos/login-user.dto';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '../../users/domain/entities/user.entity';
import { Email } from '../../users/domain/value-objects/email.value-object';
import { Password } from '../../users/domain/value-objects/password.value-object';

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      save: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };
    useCase = new LoginUserUseCase(mockUserRepository);
  });

  it('should throw UnauthorizedException if email is invalid', async () => {
    const dto: LoginUserDto = {
      email: 'invalid-email',
      password: 'password123',
    };
    await expect(useCase.execute(dto)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if user not found', async () => {
    const dto: LoginUserDto = {
      email: 'test@example.com',
      password: 'password123',
    };
    mockUserRepository.findByEmail.mockResolvedValue(null);
    await expect(useCase.execute(dto)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if password does not match', async () => {
    const dto: LoginUserDto = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };
    mockUserRepository.findByEmail.mockResolvedValue(
      User.create({
        id: '123',
        email: Email.create(dto.email),
        password: await Password.create('password123'),
        createdAt: new Date(),
      }),
    );
    await expect(useCase.execute(dto)).rejects.toThrow(UnauthorizedException);
  });

  it('should successfully log in', async () => {
    const dto: LoginUserDto = {
      email: 'test@example.com',
      password: 'password123',
    };
    mockUserRepository.findByEmail.mockResolvedValue(
      User.create({
        id: '123',
        email: Email.create(dto.email),
        password: await Password.create('password123'),
        createdAt: new Date(),
      }),
    );

    const result = await useCase.execute(dto);
    expect(result.email).toBe(dto.email);
    expect(result.id).toBe('123');
  });
});
