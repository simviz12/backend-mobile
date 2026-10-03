import { Module } from '@nestjs/common';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';

@Module({
  providers: [
    RegisterUserUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [USER_REPOSITORY, RegisterUserUseCase],
})
export class UsersModule {}
