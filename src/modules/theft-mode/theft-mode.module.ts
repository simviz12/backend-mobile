import { Module } from '@nestjs/common';
import { TheftModeController } from './presentation/controllers/theft-mode.controller';
import { ActivateTheftModeUseCase } from './application/use-cases/activate-theft-mode.use-case';
import { DeactivateTheftModeUseCase } from './application/use-cases/deactivate-theft-mode.use-case';
import { THEFT_MODE_LOG_REPOSITORY } from './domain/repositories/theft-mode-log.repository.interface';
import { PrismaTheftModeLogRepository } from './infrastructure/repositories/prisma-theft-mode-log.repository';
import { CommandsModule } from '../commands/commands.module';
import { DevicesModule } from '../devices/devices.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [CommandsModule, DevicesModule, AuthModule],
  controllers: [TheftModeController],
  providers: [
    ActivateTheftModeUseCase,
    DeactivateTheftModeUseCase,
    {
      provide: THEFT_MODE_LOG_REPOSITORY,
      useClass: PrismaTheftModeLogRepository,
    },
  ],
})
export class TheftModeModule {}
