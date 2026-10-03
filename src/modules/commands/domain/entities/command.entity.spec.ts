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

  it('should handle idempotent transitions', () => {
    expect(command.markAsSent()).toBe(true);
    expect(command.markAsSent()).toBe(false); // Idempotent

    expect(command.markAsDelivered()).toBe(true);
    expect(command.markAsExecuted()).toBe(true);
    expect(command.markAsDelivered()).toBe(false); // Idempotent/Ignored delayed ack
    expect(command.status).toBe(CommandStatus.EXECUTED);
  });

  it('should handle concurrent idempotent acks safely', async () => {
    command.markAsSent();
    // Simulate concurrent promises calling the methods
    const results = await Promise.all([
      new Promise<boolean>(resolve => resolve(command.markAsDelivered())),
      new Promise<boolean>(resolve => resolve(command.markAsDelivered())),
      new Promise<boolean>(resolve => resolve(command.markAsExecuted())),
    ]);
    
    // We expect 2 true and 1 false because the second DELIVERED will be false if it ran after DELIVERED,
    // or false if it ran after EXECUTED.
    // The exact order isn't guaranteed by Promise.all, but we expect exactly 2 operations to return true.
    const trueCount = results.filter(r => r === true).length;
    expect(trueCount).toBe(2); 
    expect(command.status).toBe(CommandStatus.EXECUTED);
  });
});
