import { Injectable, Inject } from '@nestjs/common';
import { DEVICE_REPOSITORY } from '../../domain/repositories/device.repository.interface';
import type { IDeviceRepository } from '../../domain/repositories/device.repository.interface';
import { Device, DeviceMode } from '../../domain/entities/device.entity';
import { LinkDeviceDto } from '../dtos/link-device.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LinkDeviceUseCase {
  constructor(
    @Inject(DEVICE_REPOSITORY) private readonly deviceRepository: IDeviceRepository,
  ) {}

  async execute(ownerId: string, dto: LinkDeviceDto): Promise<Device> {
    const device = Device.create({
      id: uuidv4(),
      ownerId,
      name: dto.name,
      mode: dto.mode,
      platform: dto.platform,
      fcmToken: dto.fcmToken || null,
      lastSeenAt: new Date(),
      createdAt: new Date(),
    });

    await this.deviceRepository.save(device);

    return device;
  }
}
