export enum CommandType {
  RING = 'RING',
  LOCK = 'LOCK',
  MESSAGE = 'MESSAGE',
  VIBRATE = 'VIBRATE',
  LOCATE = 'LOCATE',
  THEFT_MODE = 'THEFT_MODE',
  WIPE = 'WIPE',
}

export enum CommandStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  EXECUTED = 'EXECUTED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
}

export interface CommandProps {
  id: string;
  targetDeviceId: string;
  commandType: CommandType;
  payload?: any;
  status: CommandStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Command {
  private constructor(private readonly props: CommandProps) {}

  static create(props: CommandProps): Command {
    return new Command(props);
  }

  get id(): string { return this.props.id; }
  get targetDeviceId(): string { return this.props.targetDeviceId; }
  get commandType(): CommandType { return this.props.commandType; }
  get payload(): any { return this.props.payload; }
  get status(): CommandStatus { return this.props.status; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // State Machine Transitions
  private ensureValidTransition(targetStatus: CommandStatus): void {
    const validTransitions: Record<CommandStatus, CommandStatus[]> = {
      [CommandStatus.PENDING]: [CommandStatus.SENT, CommandStatus.FAILED, CommandStatus.EXPIRED],
      [CommandStatus.SENT]: [CommandStatus.DELIVERED, CommandStatus.FAILED, CommandStatus.EXPIRED, CommandStatus.EXECUTED], // Sometimes it jumps straight to EXECUTED
      [CommandStatus.DELIVERED]: [CommandStatus.EXECUTED, CommandStatus.FAILED],
      [CommandStatus.EXECUTED]: [],
      [CommandStatus.FAILED]: [],
      [CommandStatus.EXPIRED]: [],
    };

    if (!validTransitions[this.props.status].includes(targetStatus)) {
      throw new Error(`Invalid state transition from ${this.props.status} to ${targetStatus}`);
    }
  }

  markAsSent(): void {
    this.ensureValidTransition(CommandStatus.SENT);
    this.props.status = CommandStatus.SENT;
    this.props.updatedAt = new Date();
  }

  markAsDelivered(): void {
    this.ensureValidTransition(CommandStatus.DELIVERED);
    this.props.status = CommandStatus.DELIVERED;
    this.props.updatedAt = new Date();
  }

  markAsExecuted(): void {
    this.ensureValidTransition(CommandStatus.EXECUTED);
    this.props.status = CommandStatus.EXECUTED;
    this.props.updatedAt = new Date();
  }

  markAsFailed(): void {
    this.ensureValidTransition(CommandStatus.FAILED);
    this.props.status = CommandStatus.FAILED;
    this.props.updatedAt = new Date();
  }

  markAsExpired(): void {
    this.ensureValidTransition(CommandStatus.EXPIRED);
    this.props.status = CommandStatus.EXPIRED;
    this.props.updatedAt = new Date();
  }
}
