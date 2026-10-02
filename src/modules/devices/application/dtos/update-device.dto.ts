import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDeviceDto {
  @ApiPropertyOptional({ example: 'My New Samsung Galaxy' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: 'new-fcm-token-123' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  fcmToken?: string;
}
