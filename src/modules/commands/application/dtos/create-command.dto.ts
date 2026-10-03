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
}
