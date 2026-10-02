import { jest } from '@jest/globals';
import { SendCommandUseCase } from './send-command.use-case';
import { CommandType } from '../../domain/entities/command.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DeviceMode, Device } from '../../../devices/domain/entities/device.entity';

describe('SendCommandUseCase', () => {
  let useCase: SendCommandUseCase;
  let mockCommandRepository: any;
  let mockDeviceRepository: any;

  beforeEach(() => {
    mockCommandRepository = {
      save: jest.fn(),
    };
    mockDeviceRepository = {
      findById: jest.fn(),
    };
    useCase = new SendCommandUseCase(mockCommandRepository, mockDeviceRepository);
  });

  it('should throw NotFoundException if device is missing', async () => {
    mockDeviceRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute('user-1', { targetDeviceId: 'dev-1', commandType: CommandType.RING }))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if user is not the owner', async () => {
    const device = Device.create({
      id: 'dev-1',
      ownerId: 'user-2', // different owner
      name: 'Phone',
      mode: DeviceMode.PROTECTED,
      platform: 'Android',
      fcmToken: 'token',
      lastSeenAt: new Date(),
      createdAt: new Date(),
    });
    mockDeviceRepository.findById.mockResolvedValue(device);

    await expect(useCase.execute('user-1', { targetDeviceId: 'dev-1', commandType: CommandType.RING }))
      .rejects.toThrow(ForbiddenException);
  });

  it('should create and save command successfully', async () => {
    const device = Device.create({
      id: 'dev-1',
      ownerId: 'user-1', // same owner
      name: 'Phone',
      mode: DeviceMode.PROTECTED,
      platform: 'Android',
      fcmToken: 'token',
      lastSeenAt: new Date(),
      createdAt: new Date(),
    });
    mockDeviceRepository.findById.mockResolvedValue(device);

    const command = await useCase.execute('user-1', { targetDeviceId: 'dev-1', commandType: CommandType.RING });

    expect(command.id).toBeDefined();
    expect(command.targetDeviceId).toBe('dev-1');
    expect(command.commandType).toBe(CommandType.RING);
    expect(mockCommandRepository.save).toHaveBeenCalledWith(command);
  });
});
