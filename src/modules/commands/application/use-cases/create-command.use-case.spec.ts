import { jest } from '@jest/globals';
import { CreateCommandUseCase } from './create-command.use-case';
import { CommandType, CommandStatus } from '../../domain/entities/command.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DeviceMode, Device } from '../../../devices/domain/entities/device.entity';

describe('CreateCommandUseCase', () => {
  let useCase: CreateCommandUseCase;
  let mockCommandRepository: any;
  let mockDeviceRepository: any;
  let mockPushPort: any;

  beforeEach(() => {
    mockCommandRepository = { save: jest.fn() };
    mockDeviceRepository = { findById: jest.fn() };
    mockPushPort = { send: jest.fn() };
    useCase = new CreateCommandUseCase(mockCommandRepository, mockDeviceRepository, mockPushPort);
  });

  it('should throw NotFoundException if device missing', async () => {
    mockDeviceRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute('user-1', 'dev-1', { commandType: CommandType.RING }))
      .rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if wrong owner', async () => {
    mockDeviceRepository.findById.mockResolvedValue(Device.create({
      id: 'dev-1', ownerId: 'user-2', name: 'N', mode: DeviceMode.PROTECTED, platform: 'P', fcmToken: 'T', lastSeenAt: new Date(), createdAt: new Date()
    }));
    await expect(useCase.execute('user-1', 'dev-1', { commandType: CommandType.RING }))
      .rejects.toThrow(ForbiddenException);
  });

  it('should create command and send push successfully', async () => {
    mockDeviceRepository.findById.mockResolvedValue(Device.create({
      id: 'dev-1', ownerId: 'user-1', name: 'N', mode: DeviceMode.PROTECTED, platform: 'P', fcmToken: 'T', lastSeenAt: new Date(), createdAt: new Date()
    }));
    mockPushPort.send.mockResolvedValue(true);

    const cmd = await useCase.execute('user-1', 'dev-1', { commandType: CommandType.RING });
    
    expect(cmd.targetDeviceId).toBe('dev-1');
    expect(cmd.status).toBe(CommandStatus.SENT);
    expect(mockPushPort.send).toHaveBeenCalled();
    expect(mockCommandRepository.save).toHaveBeenCalledTimes(2); // Initial save + status update
  });

  it('should mark as FAILED if push sending fails', async () => {
    mockDeviceRepository.findById.mockResolvedValue(Device.create({
      id: 'dev-1', ownerId: 'user-1', name: 'N', mode: DeviceMode.PROTECTED, platform: 'P', fcmToken: 'T', lastSeenAt: new Date(), createdAt: new Date()
    }));
    mockPushPort.send.mockResolvedValue(false);

    const cmd = await useCase.execute('user-1', 'dev-1', { commandType: CommandType.RING });
    
    expect(cmd.status).toBe(CommandStatus.FAILED);
  });
});
