import type { Device } from '../entities/device.entity';

export const DEVICE_REPOSITORY = Symbol('DEVICE_REPOSITORY');

export interface IDeviceRepository {
  save(device: Device): Promise<void>;
  findById(id: string): Promise<Device | null>;
  findByOwnerId(ownerId: string): Promise<Device[]>;
  delete(id: string): Promise<void>;
}
