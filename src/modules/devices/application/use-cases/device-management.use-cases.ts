import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DEVICE_REPOSITORY } from '../../domain/repositories/device.repository.interface';
import type { IDeviceRepository } from '../../domain/repositories/device.repository.interface';
import { Device } from '../../domain/entities/device.entity';

@Injectable()
export class GetDevicesUseCase {
  constructor(
    @Inject(DEVICE_REPOSITORY) private readonly deviceRepository: IDeviceRepository,
  ) {}

  async execute(userId: string): Promise<Device[]> {
    return this.deviceRepository.findByOwnerId(userId);
  }
}

@Injectable()
export class GetDeviceByIdUseCase {
  constructor(
    @Inject(DEVICE_REPOSITORY) private readonly deviceRepository: IDeviceRepository,
  ) {}

  async execute(userId: string, deviceId: string): Promise<Device> {
    const device = await this.deviceRepository.findById(deviceId);
    if (!device) throw new NotFoundException('Device not found');
    if (device.ownerId !== userId) throw new ForbiddenException('Access denied');
    return device;
  }
}

@Injectable()
export class DeleteDeviceUseCase {
  constructor(
    @Inject(DEVICE_REPOSITORY) private readonly deviceRepository: IDeviceRepository,
  ) {}

  async execute(userId: string, deviceId: string): Promise<void> {
    const device = await this.deviceRepository.findById(deviceId);
    if (!device) throw new NotFoundException('Device not found');
    if (device.ownerId !== userId) throw new ForbiddenException('Access denied');
    await this.deviceRepository.delete(deviceId);
  }
}
