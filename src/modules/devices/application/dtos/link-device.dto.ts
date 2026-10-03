import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeviceMode } from '../../domain/entities/device.entity';

export class LinkDeviceDto {
  @ApiProperty({ example: 'My Samsung Galaxy' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: DeviceMode, example: DeviceMode.PROTECTED })
  @IsEnum(DeviceMode)
  mode: DeviceMode;

  @ApiProperty({ example: 'Android' })
  @IsString()
  @IsNotEmpty()
  platform: string;

  @ApiPropertyOptional({ example: 'fcm-token-123' })
  @IsString()
  @IsOptional()
  fcmToken?: string;
}
