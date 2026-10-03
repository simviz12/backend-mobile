import { Email } from '../value-objects/email.value-object';
import { Password } from '../value-objects/password.value-object';

export interface UserProps {
  id: string;
  email: Email;
  password: Password;
  createdAt: Date;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  public static create(props: UserProps): User {
    return new User(props);
  }

  get id(): string {
    return this.props.id;
  }

  get email(): Email {
    return this.props.email;
  }

  get password(): Password {
    return this.props.password;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
