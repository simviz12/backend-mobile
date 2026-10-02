export enum DeviceMode {
  PROTECTED = 'PROTECTED',
  CONTROLLER = 'CONTROLLER',
}

export interface DeviceProps {
  id: string;
  ownerId: string;
  name: string;
  mode: DeviceMode;
  platform: string;
  fcmToken: string | null;
  lastSeenAt: Date;
  createdAt: Date;
}

export class Device {
  private constructor(private readonly props: DeviceProps) {}

  static create(props: DeviceProps): Device {
    return new Device(props);
  }

  get id(): string {
    return this.props.id;
  }

  get ownerId(): string {
    return this.props.ownerId;
  }

  get name(): string {
    return this.props.name;
  }

  get mode(): DeviceMode {
    return this.props.mode;
  }

  get platform(): string {
    return this.props.platform;
  }

  get fcmToken(): string | null {
    return this.props.fcmToken;
  }

  get lastSeenAt(): Date {
    return this.props.lastSeenAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  updateLastSeen(): void {
    this.props.lastSeenAt = new Date();
  }

  updateFcmToken(token: string): void {
    this.props.fcmToken = token;
  }

  updateName(name: string): void {
    this.props.name = name;
  }
}
