import { RegisterUserUseCase } from './register-user.use-case';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { BadRequestException } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.value-object';
import { Password } from '../../domain/value-objects/password.value-object';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      save: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };
    useCase = new RegisterUserUseCase(mockUserRepository);
  });

  it('should throw BadRequestException if user already exists', async () => {
    const dto: RegisterUserDto = { email: 'test@example.com', password: 'password123' };
    mockUserRepository.findByEmail.mockResolvedValue(User.create({
      id: '123',
      email: Email.create(dto.email),
      password: await Password.create(dto.password),
      createdAt: new Date()
    }));

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
  });

  it('should successfully register a new user', async () => {
    const dto: RegisterUserDto = { email: 'test@example.com', password: 'password123' };
    mockUserRepository.findByEmail.mockResolvedValue(null);

    const result = await useCase.execute(dto);

    expect(result.email).toBe(dto.email);
    expect(result.id).toBeDefined();
    expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
  });
});
