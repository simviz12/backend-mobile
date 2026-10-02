export enum CommandType {
  RING = 'RING',
  LOCATE = 'LOCATE',
  LOCK = 'LOCK',
  SHOW_MESSAGE = 'SHOW_MESSAGE',
  VIBRATE = 'VIBRATE',
  THEFT_MODE = 'THEFT_MODE',
  WIPE = 'WIPE',
}

export enum CommandStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

export interface CommandProps {
  id: string;
  targetDeviceId: string;
  commandType: CommandType;
  payload?: any;
  status: CommandStatus;
  createdAt: Date;
  sentAt?: Date | null;
}

export class Command {
  private constructor(private readonly props: CommandProps) {}

  static create(props: CommandProps): Command {
    return new Command(props);
  }

  get id(): string {
    return this.props.id;
  }

  get targetDeviceId(): string {
    return this.props.targetDeviceId;
  }

  get commandType(): CommandType {
    return this.props.commandType;
  }

  get payload(): any {
    return this.props.payload;
  }

  get status(): CommandStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get sentAt(): Date | null | undefined {
    return this.props.sentAt;
  }

  markAsSent(): void {
    this.props.status = CommandStatus.SENT;
    this.props.sentAt = new Date();
  }

  markAsFailed(): void {
    this.props.status = CommandStatus.FAILED;
  }
}
