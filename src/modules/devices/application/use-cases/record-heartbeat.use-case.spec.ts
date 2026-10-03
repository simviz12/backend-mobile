import { jest } from '@jest/globals';
import { RecordHeartbeatUseCase } from './record-heartbeat.use-case';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DeviceMode, Device } from '../../domain/entities/device.entity';

describe('RecordHeartbeatUseCase', () => {
  let useCase: RecordHeartbeatUseCase;
  let mockDeviceRepository: any;

  beforeEach(() => {
    mockDeviceRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    useCase = new RecordHeartbeatUseCase(mockDeviceRepository);
  });

  it('should throw NotFoundException if device missing', async () => {
    mockDeviceRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute('u1', 'd1', {})).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if wrong owner', async () => {
    mockDeviceRepository.findById.mockResolvedValue(Device.create({
      id: 'd1', ownerId: 'u2', name: 'N', mode: DeviceMode.PROTECTED,
      platform: 'P', fcmToken: null, lastSeenAt: new Date(), isOnline: true, createdAt: new Date(),
    }));
    await expect(useCase.execute('u1', 'd1', {})).rejects.toThrow(ForbiddenException);
  });

  it('should update heartbeat fields and save', async () => {
    const device = Device.create({
      id: 'd1', ownerId: 'u1', name: 'N', mode: DeviceMode.PROTECTED,
      platform: 'P', fcmToken: null, lastSeenAt: new Date(Date.now() - 100000), isOnline: false, createdAt: new Date(),
    });
    mockDeviceRepository.findById.mockResolvedValue(device);

    const result = await useCase.execute('u1', 'd1', {
      batteryLevel: 85, networkType: 'WIFI', appVersion: '1.0.0'
    });

    expect(result.batteryLevel).toBe(85);
    expect(result.networkType).toBe('WIFI');
    expect(result.appVersion).toBe('1.0.0');
    expect(result.isOnline).toBe(true);
    expect(mockDeviceRepository.save).toHaveBeenCalled();
  });
});
