import { Module } from '@nestjs/common';
import { CommandsController } from './presentation/controllers/commands.controller';
import { CreateCommandUseCase } from './application/use-cases/create-command.use-case';
import { GetCommandsUseCase } from './application/use-cases/get-commands.use-case';
import { AckCommandUseCase } from './application/use-cases/ack-command.use-case';
import { PrismaCommandRepository } from './infrastructure/repositories/prisma-command.repository';
import { COMMAND_REPOSITORY } from './domain/repositories/command.repository.interface';
import { DevicesModule } from '../devices/devices.module';
import { PUSH_NOTIFICATION_PORT } from '../../shared/application/ports/push-notification.port';
import { FcmAdapter } from '../../shared/infrastructure/fcm/fcm.adapter';
import { CommandExpirationJob } from './infrastructure/jobs/command-expiration.job';

@Module({
  imports: [DevicesModule],
  controllers: [CommandsController],
  providers: [
    CreateCommandUseCase,
    GetCommandsUseCase,
    AckCommandUseCase,
    CommandExpirationJob,
    {
      provide: COMMAND_REPOSITORY,
      useClass: PrismaCommandRepository,
    },
    {
      provide: PUSH_NOTIFICATION_PORT,
      useClass: FcmAdapter,
    }
  ],
  exports: [COMMAND_REPOSITORY, CreateCommandUseCase],
})
export class CommandsModule {}
