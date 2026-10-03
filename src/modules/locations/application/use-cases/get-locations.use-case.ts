import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { LOCATION_REPOSITORY } from '../../domain/repositories/location.repository.interface';
import type { ILocationRepository, PaginatedLocations } from '../../domain/repositories/location.repository.interface';
import { DEVICE_REPOSITORY } from '../../../devices/domain/repositories/device.repository.interface';
import type { IDeviceRepository } from '../../../devices/domain/repositories/device.repository.interface';

@Injectable()
export class GetLocationsUseCase {
  constructor(
    @Inject(LOCATION_REPOSITORY) private readonly locationRepository: ILocationRepository,
    @Inject(DEVICE_REPOSITORY) private readonly deviceRepository: IDeviceRepository,
  ) {}

  async execute(
    userId: string,
    deviceId: string,
    page: number = 1,
    limit: number = 20,
    from?: string,
    to?: string,
  ): Promise<PaginatedLocations> {
    const device = await this.deviceRepository.findById(deviceId);
    if (!device) throw new NotFoundException('Device not found');
    if (device.ownerId !== userId) throw new ForbiddenException('Access denied');

    return this.locationRepository.findByDeviceId(
      deviceId,
      page,
      limit,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }
}
