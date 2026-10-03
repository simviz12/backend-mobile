import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LinkDeviceUseCase } from '../../application/use-cases/link-device.use-case';
import { GetDevicesUseCase, GetDeviceByIdUseCase, DeleteDeviceUseCase } from '../../application/use-cases/device-management.use-cases';
import { UpdateDeviceUseCase } from '../../application/use-cases/update-device.use-case';
import { RecordHeartbeatUseCase } from '../../application/use-cases/record-heartbeat.use-case';
import { LinkDeviceDto } from '../../application/dtos/link-device.dto';
import { UpdateDeviceDto } from '../../application/dtos/update-device.dto';
import { HeartbeatDto } from '../../application/dtos/heartbeat.dto';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';

@ApiTags('Devices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('devices')
export class DevicesController {
  constructor(
    private readonly linkDeviceUseCase: LinkDeviceUseCase,
    private readonly getDevicesUseCase: GetDevicesUseCase,
    private readonly getDeviceByIdUseCase: GetDeviceByIdUseCase,
    private readonly updateDeviceUseCase: UpdateDeviceUseCase,
    private readonly deleteDeviceUseCase: DeleteDeviceUseCase,
    private readonly recordHeartbeatUseCase: RecordHeartbeatUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Link a new device' })
  @ApiResponse({ status: 201, description: 'Device linked successfully' })
  async linkDevice(
    @CurrentUser() user: { id: string },
    @Body() dto: LinkDeviceDto,
  ) {
    const device = await this.linkDeviceUseCase.execute(user.id, dto);
    return this.mapDeviceToResponse(device);
  }

  @Get()
  @ApiOperation({ summary: 'List all devices for the user' })
  async getDevices(@CurrentUser() user: { id: string }) {
    const devices = await this.getDevicesUseCase.execute(user.id);
    return devices.map(d => this.mapDeviceToResponse(d));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get device by ID' })
  async getDeviceById(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    const device = await this.getDeviceByIdUseCase.execute(user.id, id);
    return this.mapDeviceToResponse(device);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update device by ID' })
  async updateDevice(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateDeviceDto,
  ) {
    const device = await this.updateDeviceUseCase.execute(user.id, id, dto);
    return this.mapDeviceToResponse(device);
  }

  @Post(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record device heartbeat and status' })
  async recordHeartbeat(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: HeartbeatDto,
  ) {
    const device = await this.recordHeartbeatUseCase.execute(user.id, id, dto);
    return this.mapDeviceToResponse(device);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete device by ID' })
  async deleteDevice(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    await this.deleteDeviceUseCase.execute(user.id, id);
  }

  private mapDeviceToResponse(device: any) {
    return {
      id: device.id,
      name: device.name,
      mode: device.mode,
      platform: device.platform,
      fcmToken: device.fcmToken,
      lastSeenAt: device.lastSeenAt,
      isOnline: device.isOnline,
      batteryLevel: device.batteryLevel,
      networkType: device.networkType,
      appVersion: device.appVersion,
    };
  }
}

