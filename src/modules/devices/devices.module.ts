import { Module } from '@nestjs/common';
import { DevicesController } from './presentation/controllers/devices.controller';
import { LinkDeviceUseCase } from './application/use-cases/link-device.use-case';
import { PrismaDeviceRepository } from './infrastructure/repositories/prisma-device.repository';
import { DEVICE_REPOSITORY } from './domain/repositories/device.repository.interface';

@Module({
  controllers: [DevicesController],
  providers: [
    LinkDeviceUseCase,
    {
      provide: DEVICE_REPOSITORY,
      useClass: PrismaDeviceRepository,
    },
  ],
  exports: [DEVICE_REPOSITORY],
})
export class DevicesModule {}
