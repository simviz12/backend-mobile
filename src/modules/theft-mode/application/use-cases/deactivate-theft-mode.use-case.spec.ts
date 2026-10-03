import { jest } from '@jest/globals';
import { DeactivateTheftModeUseCase } from './deactivate-theft-mode.use-case';
import { Device, DeviceMode } from '../../../devices/domain/entities/device.entity';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('DeactivateTheftModeUseCase', () => {
  let useCase: DeactivateTheftModeUseCase;
  let mockDeviceRepository: any;
  let mockTheftLogRepository: any;
  let mockCreateCommandUseCase: any;

  beforeEach(() => {
    mockDeviceRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    mockTheftLogRepository = {
      logAction: jest.fn(),
    };
    mockCreateCommandUseCase = {
      execute: jest.fn(),
    };

    useCase = new DeactivateTheftModeUseCase(
      mockDeviceRepository,
      mockTheftLogRepository,
      mockCreateCommandUseCase,
    );
  });

  it('should throw BadRequestException if not active', async () => {
    const device = Device.create({
      id: 'dev-1', ownerId: 'user-1', name: 'A', mode: DeviceMode.PROTECTED, platform: 'Android',
      fcmToken: null, lastSeenAt: new Date(), isOnline: true, isTheftModeActive: false, createdAt: new Date(),
    });
    mockDeviceRepository.findById.mockResolvedValue(device);
    await expect(useCase.execute('user-1', 'dev-1')).rejects.toThrow(BadRequestException);
  });

  it('should deactivate theft mode and save log', async () => {
    const device = Device.create({
      id: 'dev-1', ownerId: 'user-1', name: 'A', mode: DeviceMode.PROTECTED, platform: 'Android',
      fcmToken: null, lastSeenAt: new Date(), isOnline: true, isTheftModeActive: true, createdAt: new Date(),
    });
    mockDeviceRepository.findById.mockResolvedValue(device);

    await useCase.execute('user-1', 'dev-1');

    expect(device.isTheftModeActive).toBe(false);
    expect(mockDeviceRepository.save).toHaveBeenCalledWith(device);
    expect(mockTheftLogRepository.logAction).toHaveBeenCalledWith('dev-1', 'DEACTIVATED', expect.any(String));
  });
});
