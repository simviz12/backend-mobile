import { IsNotEmpty, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommandType } from '../../domain/entities/command.entity';

export class CreateCommandDto {
  @ApiProperty({ enum: CommandType, example: CommandType.RING })
  @IsEnum(CommandType)
  @IsNotEmpty()
  commandType: CommandType;

  @ApiPropertyOptional({ description: 'Optional data for the command' })
  @IsOptional()
  @IsObject()
  payload?: any;

  @ApiPropertyOptional({ description: 'Device ID issuing the command (required for LOCK/WIPE)' })
  @IsOptional()
  sourceDeviceId?: string;

  @ApiPropertyOptional({ description: 'User password re-confirmation (required for WIPE)' })
  @IsOptional()
  password?: string;
}
