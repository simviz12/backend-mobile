import { jest } from '@jest/globals';
import { RecordLocationUseCase } from './record-location.use-case';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DeviceMode, Device } from '../../../devices/domain/entities/device.entity';

describe('RecordLocationUseCase', () => {
  let useCase: RecordLocationUseCase;
  let mockLocationRepository: any;
  let mockDeviceRepository: any;

  beforeEach(() => {
    mockLocationRepository = { save: jest.fn() };
    mockDeviceRepository = { findById: jest.fn() };
    useCase = new RecordLocationUseCase(mockLocationRepository, mockDeviceRepository);
  });

  it('should throw NotFoundException if device missing', async () => {
    mockDeviceRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute('u1', 'd1', { lat: 4.6, lng: -74, recordedAt: new Date().toISOString() }))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if wrong owner', async () => {
    mockDeviceRepository.findById.mockResolvedValue(Device.create({
      id: 'd1', ownerId: 'u2', name: 'N', mode: DeviceMode.PROTECTED,
      platform: 'P', fcmToken: null, lastSeenAt: new Date(), createdAt: new Date(), isOnline: true }));
    await expect(useCase.execute('u1', 'd1', { lat: 4.6, lng: -74, recordedAt: new Date().toISOString() }))
      .rejects.toThrow(ForbiddenException);
  });

  it('should save location', async () => {
    mockDeviceRepository.findById.mockResolvedValue(Device.create({
      id: 'd1', ownerId: 'u1', name: 'N', mode: DeviceMode.PROTECTED,
      platform: 'P', fcmToken: null, lastSeenAt: new Date(), createdAt: new Date(), isOnline: true }));

    const loc = await useCase.execute('u1', 'd1', {
      lat: 4.6097, lng: -74.0817, accuracy: 10, recordedAt: new Date().toISOString(),
    });

    expect(loc.lat).toBe(4.6097);
    expect(loc.lng).toBe(-74.0817);
    expect(mockLocationRepository.save).toHaveBeenCalled();
  });

  it('should reject invalid coordinates', async () => {
    mockDeviceRepository.findById.mockResolvedValue(Device.create({
      id: 'd1', ownerId: 'u1', name: 'N', mode: DeviceMode.PROTECTED,
      platform: 'P', fcmToken: null, lastSeenAt: new Date(), createdAt: new Date(), isOnline: true }));

    await expect(useCase.execute('u1', 'd1', {
      lat: 200, lng: -74, recordedAt: new Date().toISOString(),
    })).rejects.toThrow(/Latitude/);
  });
});


