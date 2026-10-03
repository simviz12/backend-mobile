import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DEVICE_REPOSITORY } from '../../domain/repositories/device.repository.interface';
import type { IDeviceRepository } from '../../domain/repositories/device.repository.interface';
import { EVENT_PUBLISHER_PORT } from '../../../../shared/application/ports/event-publisher.port';
import type { IEventPublisherPort } from '../../../../shared/application/ports/event-publisher.port';
import { HeartbeatDto } from '../dtos/heartbeat.dto';
import type { Device } from '../../domain/entities/device.entity';

@Injectable()
export class RecordHeartbeatUseCase {
  constructor(
    @Inject(DEVICE_REPOSITORY) private readonly deviceRepository: IDeviceRepository,
    @Inject(EVENT_PUBLISHER_PORT) private readonly eventPublisher: IEventPublisherPort,
  ) {}

  async execute(userId: string, deviceId: string, dto: HeartbeatDto): Promise<Device> {
    const device = await this.deviceRepository.findById(deviceId);
    if (!device) throw new NotFoundException('Device not found');
    if (device.ownerId !== userId) throw new ForbiddenException('Access denied');

    const wasOffline = !device.isOnline;
    device.recordHeartbeat(dto.batteryLevel, dto.networkType, dto.appVersion);
    await this.deviceRepository.save(device);

    if (wasOffline) {
      this.eventPublisher.publishToUser(userId, 'device.online', { deviceId: device.id, lastSeenAt: device.lastSeenAt });
    }

    return device;
  }
}
