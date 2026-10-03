export interface RefreshTokenProps {
  id: string;
  token: string;
  userId: string;
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
}

export class RefreshToken {
  private constructor(private readonly props: RefreshTokenProps) {}

  static create(props: RefreshTokenProps): RefreshToken {
    return new RefreshToken(props);
  }

  get id(): string {
    return this.props.id;
  }

  get token(): string {
    return this.props.token;
  }

  get userId(): string {
    return this.props.userId;
  }

  get isRevoked(): boolean {
    return this.props.isRevoked;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  revoke(): void {
    this.props.isRevoked = true;
  }

  isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }

  isValid(): boolean {
    return !this.isRevoked && !this.isExpired();
  }
}
