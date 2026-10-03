import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DEVICE_REPOSITORY } from '../../domain/repositories/device.repository.interface';
import type { IDeviceRepository } from '../../domain/repositories/device.repository.interface';
import { Device } from '../../domain/entities/device.entity';
import { UpdateDeviceDto } from '../dtos/update-device.dto';

@Injectable()
export class UpdateDeviceUseCase {
  constructor(
    @Inject(DEVICE_REPOSITORY) private readonly deviceRepository: IDeviceRepository,
  ) {}

  async execute(userId: string, deviceId: string, dto: UpdateDeviceDto): Promise<Device> {
    const device = await this.deviceRepository.findById(deviceId);
    if (!device) throw new NotFoundException('Device not found');
    if (device.ownerId !== userId) throw new ForbiddenException('Access denied');

    if (dto.name) {
      device.updateName(dto.name);
    }
    if (dto.fcmToken) {
      device.updateFcmToken(dto.fcmToken);
    }

    await this.deviceRepository.save(device);
    return device;
  }
}
