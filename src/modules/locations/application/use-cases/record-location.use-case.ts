import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { LOCATION_REPOSITORY } from '../../domain/repositories/location.repository.interface';
import type { ILocationRepository } from '../../domain/repositories/location.repository.interface';
import { DEVICE_REPOSITORY } from '../../../devices/domain/repositories/device.repository.interface';
import type { IDeviceRepository } from '../../../devices/domain/repositories/device.repository.interface';
import { Location } from '../../domain/entities/location.entity';
import { CreateLocationDto } from '../dtos/create-location.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RecordLocationUseCase {
  constructor(
    @Inject(LOCATION_REPOSITORY) private readonly locationRepository: ILocationRepository,
    @Inject(DEVICE_REPOSITORY) private readonly deviceRepository: IDeviceRepository,
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
    return location;
  }
}
