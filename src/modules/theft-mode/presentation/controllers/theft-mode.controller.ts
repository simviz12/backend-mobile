import { Controller, Post, Delete, Get, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ActivateTheftModeUseCase } from '../application/use-cases/activate-theft-mode.use-case';
import { DeactivateTheftModeUseCase } from '../application/use-cases/deactivate-theft-mode.use-case';
import { JwtAuthGuard } from '../../../shared/infrastructure/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('devices/:id/theft-mode')
export class TheftModeController {
  constructor(
    private readonly activateTheftModeUseCase: ActivateTheftModeUseCase,
    private readonly deactivateTheftModeUseCase: DeactivateTheftModeUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async activate(@Request() req: any, @Param('id') deviceId: string) {
    await this.activateTheftModeUseCase.execute(req.user.userId, deviceId);
    return { success: true, message: 'Theft mode activated' };
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  async deactivate(@Request() req: any, @Param('id') deviceId: string) {
    await this.deactivateTheftModeUseCase.execute(req.user.userId, deviceId);
    return { success: true, message: 'Theft mode deactivated' };
  }
}
