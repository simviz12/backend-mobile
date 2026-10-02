import { Module } from '@nestjs/common';
import { DevicesController } from './presentation/controllers/devices.controller';
import { LinkDeviceUseCase } from './application/use-cases/link-device.use-case';
import { GetDevicesUseCase, GetDeviceByIdUseCase, DeleteDeviceUseCase } from './application/use-cases/device-management.use-cases';
import { UpdateDeviceUseCase } from './application/use-cases/update-device.use-case';
import { PrismaDeviceRepository } from './infrastructure/repositories/prisma-device.repository';
import { DEVICE_REPOSITORY } from './domain/repositories/device.repository.interface';

@Module({
  controllers: [DevicesController],
  providers: [
    LinkDeviceUseCase,
    GetDevicesUseCase,
    GetDeviceByIdUseCase,
    UpdateDeviceUseCase,
    DeleteDeviceUseCase,
    {
      provide: DEVICE_REPOSITORY,
      useClass: PrismaDeviceRepository,
    },
  ],
})
export class DevicesModule {}
