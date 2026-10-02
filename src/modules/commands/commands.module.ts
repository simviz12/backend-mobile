import { Module } from '@nestjs/common';
import { CommandsController } from './presentation/controllers/commands.controller';
import { CreateCommandUseCase } from './application/use-cases/create-command.use-case';
import { PrismaCommandRepository } from './infrastructure/repositories/prisma-command.repository';
import { COMMAND_REPOSITORY } from './domain/repositories/command.repository.interface';
import { DevicesModule } from '../devices/devices.module';

@Module({
  imports: [DevicesModule],
  controllers: [CommandsController],
  providers: [
    CreateCommandUseCase,
    {
      provide: COMMAND_REPOSITORY,
      useClass: PrismaCommandRepository,
    },
  ],
  exports: [COMMAND_REPOSITORY],
})
export class CommandsModule {}
