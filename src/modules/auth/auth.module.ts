import { Module } from '@nestjs/common';
import { AuthController } from './presentation/controllers/auth.controller';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [LoginUserUseCase],
})
export class AuthModule {}
