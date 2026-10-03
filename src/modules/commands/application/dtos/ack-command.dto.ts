import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AckCommandDto {
  @ApiProperty({ enum: ['DELIVERED', 'EXECUTED', 'FAILED'], example: 'EXECUTED' })
  @IsString()
  @IsNotEmpty()
  @IsIn(['DELIVERED', 'EXECUTED', 'FAILED'])
  status: 'DELIVERED' | 'EXECUTED' | 'FAILED';
}
