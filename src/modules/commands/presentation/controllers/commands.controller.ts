import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CreateCommandUseCase } from '../../application/use-cases/create-command.use-case';
import { GetCommandsUseCase } from '../../application/use-cases/get-commands.use-case';
import { AckCommandUseCase } from '../../application/use-cases/ack-command.use-case';
import { CreateCommandDto } from '../../application/dtos/create-command.dto';
import { AckCommandDto } from '../../application/dtos/ack-command.dto';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';

@ApiTags('Commands')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('devices/:deviceId/commands')
export class CommandsController {
  constructor(
    private readonly createCommandUseCase: CreateCommandUseCase,
    private readonly getCommandsUseCase: GetCommandsUseCase,
    private readonly ackCommandUseCase: AckCommandUseCase,
  ) {}

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

  @Get()
  @ApiOperation({ summary: 'List commands for a device with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  async getCommands(
    @CurrentUser() user: { id: string },
    @Param('deviceId') deviceId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 20;
    const result = await this.getCommandsUseCase.execute(user.id, deviceId, p, l, status);
    return {
      data: result.data.map((cmd) => ({
        id: cmd.id,
        targetDeviceId: cmd.targetDeviceId,
        commandType: cmd.commandType,
        status: cmd.status,
        payload: cmd.payload,
        createdAt: cmd.createdAt,
        updatedAt: cmd.updatedAt,
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Patch(':commandId/ack')
  @ApiOperation({ summary: 'Acknowledge command (device confirms receipt/execution)' })
  @ApiResponse({ status: 200, description: 'Command acknowledged' })
  async ackCommand(
    @Param('commandId') commandId: string,
    @Body() dto: AckCommandDto,
  ) {
    const command = await this.ackCommandUseCase.execute(commandId, dto.status);
    return {
      id: command.id,
      status: command.status,
      updatedAt: command.updatedAt,
    };
  }
}
