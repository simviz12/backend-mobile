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
  batteryLevel?: number | null;
  networkType?: string | null;
  appVersion?: string | null;
  isOnline: boolean;
  isTheftModeActive: boolean;
  createdAt: Date;
}

export class Device {
  private constructor(private readonly props: DeviceProps) {}

  static create(props: DeviceProps): Device {
    return new Device(props);
  }

  get id(): string { return this.props.id; }
  get ownerId(): string { return this.props.ownerId; }
  get name(): string { return this.props.name; }
  get mode(): DeviceMode { return this.props.mode; }
  get platform(): string { return this.props.platform; }
  get fcmToken(): string | null { return this.props.fcmToken; }
  get lastSeenAt(): Date { return this.props.lastSeenAt; }
  get batteryLevel(): number | null | undefined { return this.props.batteryLevel; }
  get networkType(): string | null | undefined { return this.props.networkType; }
  get appVersion(): string | null | undefined { return this.props.appVersion; }
  get isOnline(): boolean { return this.props.isOnline; }
  get isTheftModeActive(): boolean { return this.props.isTheftModeActive; }
  get createdAt(): Date { return this.props.createdAt; }

  updateLastSeen(): void {
    this.props.lastSeenAt = new Date();
    this.props.isOnline = true;
  }

  recordHeartbeat(batteryLevel?: number, networkType?: string, appVersion?: string): void {
    this.props.batteryLevel = batteryLevel ?? this.props.batteryLevel;
    this.props.networkType = networkType ?? this.props.networkType;
    this.props.appVersion = appVersion ?? this.props.appVersion;
    this.updateLastSeen();
  }

  markOffline(): void {
    this.props.isOnline = false;
  }

  updateFcmToken(token: string): void {
    this.props.fcmToken = token;
  }

  updateName(name: string): void {
    this.props.name = name;
  }

  activateTheftMode(): void {
    this.props.isTheftModeActive = true;
  }

  deactivateTheftMode(): void {
    this.props.isTheftModeActive = false;
  }
}
