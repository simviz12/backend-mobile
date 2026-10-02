import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommandType } from '../../domain/entities/command.entity';

export class CommandDto {
  @ApiProperty({ enum: CommandType, example: CommandType.RING })
  @IsEnum(CommandType)
  commandType: CommandType;

  @ApiProperty({ example: 'device-uuid' })
  @IsString()
  @IsNotEmpty()
  targetDeviceId: string;

  @ApiPropertyOptional({ description: 'Optional data for the command' })
  @IsOptional()
  @IsObject()
  payload?: any;
}
