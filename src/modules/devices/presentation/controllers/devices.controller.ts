import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LinkDeviceUseCase } from '../../application/use-cases/link-device.use-case';
import { LinkDeviceDto } from '../../application/dtos/link-device.dto';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';

@ApiTags('Devices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('devices')
export class DevicesController {
  constructor(private readonly linkDeviceUseCase: LinkDeviceUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Link a new device' })
  @ApiResponse({ status: 201, description: 'Device linked successfully' })
  async linkDevice(
    @CurrentUser() user: { id: string },
    @Body() dto: LinkDeviceDto,
  ) {
    const device = await this.linkDeviceUseCase.execute(user.id, dto);
    return {
      id: device.id,
      ownerId: device.ownerId,
      name: device.name,
      mode: device.mode,
      platform: device.platform,
      fcmToken: device.fcmToken,
      lastSeenAt: device.lastSeenAt,
      createdAt: device.createdAt,
    };
  }
}
