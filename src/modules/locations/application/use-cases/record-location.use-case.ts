import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { LOCATION_REPOSITORY } from '../../domain/repositories/location.repository.interface';
import type { ILocationRepository } from '../../domain/repositories/location.repository.interface';
import { DEVICE_REPOSITORY } from '../../../devices/domain/repositories/device.repository.interface';
import type { IDeviceRepository } from '../../../devices/domain/repositories/device.repository.interface';
import { EVENT_PUBLISHER_PORT } from '../../../../shared/application/ports/event-publisher.port';
import type { IEventPublisherPort } from '../../../../shared/application/ports/event-publisher.port';
import { Location } from '../../domain/entities/location.entity';
import { CreateLocationDto } from '../dtos/create-location.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RecordLocationUseCase {
  constructor(
    @Inject(LOCATION_REPOSITORY) private readonly locationRepository: ILocationRepository,
    @Inject(DEVICE_REPOSITORY) private readonly deviceRepository: IDeviceRepository,
    @Inject(EVENT_PUBLISHER_PORT) private readonly eventPublisher: IEventPublisherPort,
  ) {}

  async execute(userId: string, deviceId: string, dto: CreateLocationDto): Promise<Location> {
    const device = await this.deviceRepository.findById(deviceId);
    if (!device) throw new NotFoundException('Device not found');
    if (device.ownerId !== userId) throw new ForbiddenException('Access denied');

    const location = Location.create({
      id: uuidv4(),
      deviceId,
      lat: dto.lat,
      lng: dto.lng,
      accuracy: dto.accuracy,
      recordedAt: new Date(dto.recordedAt),
      createdAt: new Date(),
    });

    await this.locationRepository.save(location);

    this.eventPublisher.publishToUser(userId, 'location.updated', {
      deviceId,
      lat: location.lat,
      lng: location.lng,
      accuracy: location.accuracy,
      recordedAt: location.recordedAt,
    });

    return location;
  }
}
