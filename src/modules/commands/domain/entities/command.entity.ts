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
  private ensureValidTransition(targetStatus: CommandStatus): boolean {
    if (this.props.status === targetStatus) {
      return false; // Already in target state (idempotent)
    }

    const validTransitions: Record<CommandStatus, CommandStatus[]> = {
      [CommandStatus.PENDING]: [CommandStatus.SENT, CommandStatus.FAILED, CommandStatus.EXPIRED],
      [CommandStatus.SENT]: [CommandStatus.DELIVERED, CommandStatus.FAILED, CommandStatus.EXPIRED, CommandStatus.EXECUTED], // Sometimes it jumps straight to EXECUTED
      [CommandStatus.DELIVERED]: [CommandStatus.EXECUTED, CommandStatus.FAILED],
      [CommandStatus.EXECUTED]: [],
      [CommandStatus.FAILED]: [],
      [CommandStatus.EXPIRED]: [],
    };

    // If it's EXECUTED but we get a DELIVERED ack, just ignore it (idempotent for delayed acks)
    if (this.props.status === CommandStatus.EXECUTED && targetStatus === CommandStatus.DELIVERED) {
      return false;
    }

    if (!validTransitions[this.props.status].includes(targetStatus)) {
      throw new Error(`Invalid state transition from ${this.props.status} to ${targetStatus}`);
    }

    return true; // Valid transition
  }

  markAsSent(): boolean {
    if (!this.ensureValidTransition(CommandStatus.SENT)) return false;
    this.props.status = CommandStatus.SENT;
    this.props.updatedAt = new Date();
    return true;
  }

  markAsDelivered(): boolean {
    if (!this.ensureValidTransition(CommandStatus.DELIVERED)) return false;
    this.props.status = CommandStatus.DELIVERED;
    this.props.updatedAt = new Date();
    return true;
  }

  markAsExecuted(): boolean {
    if (!this.ensureValidTransition(CommandStatus.EXECUTED)) return false;
    this.props.status = CommandStatus.EXECUTED;
    this.props.updatedAt = new Date();
    return true;
  }

  markAsFailed(): boolean {
    if (!this.ensureValidTransition(CommandStatus.FAILED)) return false;
    this.props.status = CommandStatus.FAILED;
    this.props.updatedAt = new Date();
    return true;
  }

  markAsExpired(): boolean {
    if (!this.ensureValidTransition(CommandStatus.EXPIRED)) return false;
    this.props.status = CommandStatus.EXPIRED;
    this.props.updatedAt = new Date();
    return true;
  }
}
