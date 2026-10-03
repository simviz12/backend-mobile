import { Controller, Post, Delete, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ActivateTheftModeUseCase } from '../application/use-cases/activate-theft-mode.use-case';
import { DeactivateTheftModeUseCase } from '../application/use-cases/deactivate-theft-mode.use-case';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/presentation/decorators/current-user.decorator';

@ApiTags('Theft Mode')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('devices/:id/theft-mode')
export class TheftModeController {
  constructor(
    private readonly activateTheftModeUseCase: ActivateTheftModeUseCase,
    private readonly deactivateTheftModeUseCase: DeactivateTheftModeUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate theft mode on a device' })
  async activate(@CurrentUser() user: { id: string }, @Param('id') deviceId: string) {
    await this.activateTheftModeUseCase.execute(user.id, deviceId);
    return { success: true, message: 'Theft mode activated' };
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate theft mode on a device' })
  async deactivate(@CurrentUser() user: { id: string }, @Param('id') deviceId: string) {
    await this.deactivateTheftModeUseCase.execute(user.id, deviceId);
    return { success: true, message: 'Theft mode deactivated' };
  }
}
