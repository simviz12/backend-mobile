import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DEVICE_REPOSITORY } from '../../domain/repositories/device.repository.interface';
import type { IDeviceRepository } from '../../domain/repositories/device.repository.interface';
import { HeartbeatDto } from '../dtos/heartbeat.dto';
import type { Device } from '../../domain/entities/device.entity';

@Injectable()
export class RecordHeartbeatUseCase {
  constructor(
    @Inject(DEVICE_REPOSITORY) private readonly deviceRepository: IDeviceRepository,
  ) {}

  async execute(userId: string, deviceId: string, dto: HeartbeatDto): Promise<Device> {
    const device = await this.deviceRepository.findById(deviceId);
    if (!device) throw new NotFoundException('Device not found');
    if (device.ownerId !== userId) throw new ForbiddenException('Access denied');

    device.recordHeartbeat(dto.batteryLevel, dto.networkType, dto.appVersion);
    await this.deviceRepository.save(device);

    return device;
  }
}
