import { jest } from '@jest/globals';
import { ActivateTheftModeUseCase } from './activate-theft-mode.use-case';
import { Device, DeviceMode } from '../../../devices/domain/entities/device.entity';
import { CommandType } from '../../../commands/domain/entities/command.entity';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('ActivateTheftModeUseCase', () => {
  let useCase: ActivateTheftModeUseCase;
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

    useCase = new ActivateTheftModeUseCase(
      mockDeviceRepository,
      mockTheftLogRepository,
      mockCreateCommandUseCase,
    );
  });

  it('should throw NotFoundException if device missing', async () => {
    mockDeviceRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute('user-1', 'dev-1')).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if owner mismatch', async () => {
    const device = Device.create({
      id: 'dev-1', ownerId: 'user-2', name: 'A', mode: DeviceMode.PROTECTED, platform: 'Android',
      fcmToken: null, lastSeenAt: new Date(), isOnline: true, isTheftModeActive: false, createdAt: new Date(),
    });
    mockDeviceRepository.findById.mockResolvedValue(device);
    await expect(useCase.execute('user-1', 'dev-1')).rejects.toThrow(ForbiddenException);
  });

  it('should throw BadRequestException if already active', async () => {
    const device = Device.create({
      id: 'dev-1', ownerId: 'user-1', name: 'A', mode: DeviceMode.PROTECTED, platform: 'Android',
      fcmToken: null, lastSeenAt: new Date(), isOnline: true, isTheftModeActive: true, createdAt: new Date(),
    });
    mockDeviceRepository.findById.mockResolvedValue(device);
    await expect(useCase.execute('user-1', 'dev-1')).rejects.toThrow(BadRequestException);
  });

  it('should activate theft mode, save log, and dispatch commands', async () => {
    const device = Device.create({
      id: 'dev-1', ownerId: 'user-1', name: 'A', mode: DeviceMode.PROTECTED, platform: 'Android',
      fcmToken: null, lastSeenAt: new Date(), isOnline: true, isTheftModeActive: false, createdAt: new Date(),
    });
    mockDeviceRepository.findById.mockResolvedValue(device);

    await useCase.execute('user-1', 'dev-1');

    expect(device.isTheftModeActive).toBe(true);
    expect(mockDeviceRepository.save).toHaveBeenCalledWith(device);
    expect(mockTheftLogRepository.logAction).toHaveBeenCalledWith('dev-1', 'ACTIVATED', expect.any(String));

    // Should orchestrate commands
    expect(mockCreateCommandUseCase.execute).toHaveBeenCalledWith('user-1', 'dev-1', { commandType: CommandType.LOCK });
    expect(mockCreateCommandUseCase.execute).toHaveBeenCalledWith('user-1', 'dev-1', { commandType: CommandType.RING });
    expect(mockCreateCommandUseCase.execute).toHaveBeenCalledWith('user-1', 'dev-1', expect.objectContaining({ commandType: CommandType.MESSAGE }));
    expect(mockCreateCommandUseCase.execute).toHaveBeenCalledWith('user-1', 'dev-1', { commandType: CommandType.LOCATE });
    expect(mockCreateCommandUseCase.execute).toHaveBeenCalledWith('user-1', 'dev-1', { commandType: CommandType.THEFT_MODE });
  });
});
