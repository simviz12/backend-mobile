import { jest } from '@jest/globals';
import { GetCommandsUseCase } from './get-commands.use-case';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DeviceMode, Device } from '../../../devices/domain/entities/device.entity';
import { Command, CommandStatus, CommandType } from '../../domain/entities/command.entity';

describe('GetCommandsUseCase', () => {
  let useCase: GetCommandsUseCase;
  let mockCommandRepository: any;
  let mockDeviceRepository: any;

  beforeEach(() => {
    mockCommandRepository = { findByDeviceId: jest.fn() };
    mockDeviceRepository = { findById: jest.fn() };
    useCase = new GetCommandsUseCase(mockCommandRepository, mockDeviceRepository);
  });

  it('should throw NotFoundException if device not found', async () => {
    mockDeviceRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute('user-1', 'dev-1')).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if wrong owner', async () => {
    mockDeviceRepository.findById.mockResolvedValue(Device.create({
      id: 'dev-1', ownerId: 'user-2', name: 'N', mode: DeviceMode.PROTECTED,
      platform: 'P', fcmToken: 'T', lastSeenAt: new Date(), createdAt: new Date(),
    }));
    await expect(useCase.execute('user-1', 'dev-1')).rejects.toThrow(ForbiddenException);
  });

  it('should return paginated commands', async () => {
    mockDeviceRepository.findById.mockResolvedValue(Device.create({
      id: 'dev-1', ownerId: 'user-1', name: 'N', mode: DeviceMode.PROTECTED,
      platform: 'P', fcmToken: 'T', lastSeenAt: new Date(), createdAt: new Date(),
    }));

    const mockResult = {
      data: [Command.create({
        id: 'cmd-1', targetDeviceId: 'dev-1', commandType: CommandType.RING,
        status: CommandStatus.PENDING, createdAt: new Date(), updatedAt: new Date(),
      })],
      total: 1,
      page: 1,
      limit: 20,
    };
    mockCommandRepository.findByDeviceId.mockResolvedValue(mockResult);

    const result = await useCase.execute('user-1', 'dev-1');
    expect(result.total).toBe(1);
    expect(result.data.length).toBe(1);
  });
});
