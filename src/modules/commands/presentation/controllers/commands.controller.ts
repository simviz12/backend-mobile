import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SendCommandUseCase } from '../../application/use-cases/send-command.use-case';
import { CommandDto } from '../../application/dtos/command.dto';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';

@ApiTags('Commands')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('commands')
export class CommandsController {
  constructor(private readonly sendCommandUseCase: SendCommandUseCase) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Send a remote command to a protected device' })
  @ApiResponse({ status: 202, description: 'Command accepted and queued' })
  @ApiResponse({ status: 403, description: 'Forbidden (Ownership check failed)' })
  async sendCommand(
    @CurrentUser() user: { id: string },
    @Body() dto: CommandDto,
  ) {
    const command = await this.sendCommandUseCase.execute(user.id, dto);
    return {
      id: command.id,
      targetDeviceId: command.targetDeviceId,
      commandType: command.commandType,
      status: command.status,
      createdAt: command.createdAt,
    };
  }
}
