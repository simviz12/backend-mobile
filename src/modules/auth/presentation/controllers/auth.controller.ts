import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RegisterUserUseCase } from '../../../users/application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../../application/use-cases/login-user.use-case';
import { RegisterUserDto } from '../../../users/application/dtos/register-user.dto';
import { LoginUserDto } from '../../application/dtos/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    return this.registerUserUseCase.execute(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginUserDto) {
    return this.loginUserUseCase.execute(dto);
  }
}
