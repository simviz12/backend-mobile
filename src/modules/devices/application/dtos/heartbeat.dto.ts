import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class HeartbeatDto {
  @ApiPropertyOptional({ example: 85, description: 'Battery percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  batteryLevel?: number;

  @ApiPropertyOptional({ example: 'WIFI', description: 'Network type' })
  @IsOptional()
  @IsString()
  networkType?: string;

  @ApiPropertyOptional({ example: '1.0.0', description: 'App version' })
  @IsOptional()
  @IsString()
  appVersion?: string;
}
