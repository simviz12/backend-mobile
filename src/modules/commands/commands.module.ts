import { Module } from '@nestjs/common';
import { CommandsController } from './presentation/controllers/commands.controller';
import { SendCommandUseCase } from './application/use-cases/send-command.use-case';
import { PrismaCommandRepository } from './infrastructure/repositories/prisma-command.repository';
import { COMMAND_REPOSITORY } from './domain/repositories/command.repository.interface';
import { DevicesModule } from '../devices/devices.module';

@Module({
  imports: [DevicesModule],
  controllers: [CommandsController],
  providers: [
    SendCommandUseCase,
    {
      provide: COMMAND_REPOSITORY,
      useClass: PrismaCommandRepository,
    },
  ],
})
export class CommandsModule {}
