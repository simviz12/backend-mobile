import { jest } from '@jest/globals';
import { AckCommandUseCase } from './ack-command.use-case';
import { Command, CommandStatus, CommandType } from '../../domain/entities/command.entity';
import { NotFoundException } from '@nestjs/common';

describe('AckCommandUseCase', () => {
  let useCase: AckCommandUseCase;
  let mockCommandRepository: any;

  beforeEach(() => {
    mockCommandRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    useCase = new AckCommandUseCase(mockCommandRepository);
  });

  it('should throw NotFoundException if command not found', async () => {
    mockCommandRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute('cmd-1', 'EXECUTED')).rejects.toThrow(NotFoundException);
  });

  it('should mark as DELIVERED', async () => {
    const cmd = Command.create({
      id: 'cmd-1', targetDeviceId: 'dev-1', commandType: CommandType.RING,
      status: CommandStatus.SENT, createdAt: new Date(), updatedAt: new Date(),
    });
    mockCommandRepository.findById.mockResolvedValue(cmd);

    const result = await useCase.execute('cmd-1', 'DELIVERED');
    expect(result.status).toBe(CommandStatus.DELIVERED);
    expect(mockCommandRepository.save).toHaveBeenCalled();
  });

  it('should mark as EXECUTED', async () => {
    const cmd = Command.create({
      id: 'cmd-1', targetDeviceId: 'dev-1', commandType: CommandType.RING,
      status: CommandStatus.SENT, createdAt: new Date(), updatedAt: new Date(),
    });
    mockCommandRepository.findById.mockResolvedValue(cmd);

    const result = await useCase.execute('cmd-1', 'EXECUTED');
    expect(result.status).toBe(CommandStatus.EXECUTED);
  });

  it('should throw on invalid transition (e.g. EXPIRED -> EXECUTED)', async () => {
    const cmd = Command.create({
      id: 'cmd-1', targetDeviceId: 'dev-1', commandType: CommandType.RING,
      status: CommandStatus.EXPIRED, createdAt: new Date(), updatedAt: new Date(),
    });
    mockCommandRepository.findById.mockResolvedValue(cmd);

    await expect(useCase.execute('cmd-1', 'EXECUTED')).rejects.toThrow(/Invalid state transition/);
  });
});
