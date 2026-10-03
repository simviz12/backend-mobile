import { Command, CommandStatus, CommandType } from './command.entity';

describe('Command Entity State Machine', () => {
  let command: Command;

  beforeEach(() => {
    command = Command.create({
      id: 'cmd-1',
      targetDeviceId: 'dev-1',
      commandType: CommandType.RING,
      status: CommandStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it('should transition PENDING -> SENT', () => {
    command.markAsSent();
    expect(command.status).toBe(CommandStatus.SENT);
  });

  it('should transition SENT -> DELIVERED -> EXECUTED', () => {
    command.markAsSent();
    command.markAsDelivered();
    expect(command.status).toBe(CommandStatus.DELIVERED);
    command.markAsExecuted();
    expect(command.status).toBe(CommandStatus.EXECUTED);
  });

  it('should prevent invalid transition PENDING -> EXECUTED', () => {
    expect(() => command.markAsExecuted()).toThrow(/Invalid state transition/);
  });

  it('should prevent invalid transition EXPIRED -> SENT', () => {
    command.markAsExpired();
    expect(() => command.markAsSent()).toThrow(/Invalid state transition/);
  });

  it('should prevent transitioning from terminal states', () => {
    command.markAsSent();
    command.markAsDelivered();
    command.markAsExecuted();

    expect(() => command.markAsFailed()).toThrow(/Invalid state transition/);
  });
});
