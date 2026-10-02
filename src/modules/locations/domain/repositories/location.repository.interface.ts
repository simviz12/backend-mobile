import type { Location } from '../entities/location.entity';

export const LOCATION_REPOSITORY = Symbol('LOCATION_REPOSITORY');

export interface PaginatedLocations {
  data: Location[];
  total: number;
  page: number;
  limit: number;
}

export interface ILocationRepository {
  save(location: Location): Promise<void>;
  findByDeviceId(
    deviceId: string,
    page: number,
    limit: number,
    from?: Date,
    to?: Date,
  ): Promise<PaginatedLocations>;
}
