import { Controller, Post, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateCommandUseCase } from '../../application/use-cases/create-command.use-case';
import { CreateCommandDto } from '../../application/dtos/create-command.dto';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';

@ApiTags('Commands')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('devices/:deviceId/commands')
export class CommandsController {
  constructor(private readonly createCommandUseCase: CreateCommandUseCase) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Create a remote command for a device' })
  @ApiResponse({ status: 202, description: 'Command created' })
  async createCommand(
    @CurrentUser() user: { id: string },
    @Param('deviceId') deviceId: string,
    @Body() dto: CreateCommandDto,
  ) {
    const command = await this.createCommandUseCase.execute(user.id, deviceId, dto);
    return {
      id: command.id,
      targetDeviceId: command.targetDeviceId,
      commandType: command.commandType,
      status: command.status,
      createdAt: command.createdAt,
    };
  }
}
