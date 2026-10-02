import { Command, CommandType, CommandStatus } from './command.entity';

describe('Command Entity', () => {
  it('should create a command and update status', () => {
    const command = Command.create({
      id: 'cmd-1',
      targetDeviceId: 'dev-1',
      commandType: CommandType.RING,
      status: CommandStatus.PENDING,
      createdAt: new Date(),
    });

    expect(command.id).toBe('cmd-1');
    expect(command.targetDeviceId).toBe('dev-1');
    expect(command.commandType).toBe(CommandType.RING);
    expect(command.status).toBe(CommandStatus.PENDING);
    expect(command.sentAt).toBeUndefined();

    command.markAsSent();
    expect(command.status).toBe(CommandStatus.SENT);
    expect(command.sentAt).toBeDefined();

    command.markAsFailed();
    expect(command.status).toBe(CommandStatus.FAILED);
  });
});
