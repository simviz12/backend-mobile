export interface LocationProps {
  id: string;
  deviceId: string;
  lat: number;
  lng: number;
  accuracy?: number | null;
  recordedAt: Date;
  createdAt: Date;
}

export class Location {
  private constructor(private readonly props: LocationProps) {}

  static create(props: LocationProps): Location {
    if (props.lat < -90 || props.lat > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }
    if (props.lng < -180 || props.lng > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }
    return new Location(props);
  }

  get id(): string { return this.props.id; }
  get deviceId(): string { return this.props.deviceId; }
  get lat(): number { return this.props.lat; }
  get lng(): number { return this.props.lng; }
  get accuracy(): number | null | undefined { return this.props.accuracy; }
  get recordedAt(): Date { return this.props.recordedAt; }
  get createdAt(): Date { return this.props.createdAt; }
}
