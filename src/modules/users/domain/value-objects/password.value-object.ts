import * as argon2 from 'argon2';

export class Password {
  private constructor(
    public readonly value: string,
    public readonly isHashed: boolean,
  ) {}

  public static async create(
    password: string,
    isHashed = false,
  ): Promise<Password> {
    if (!isHashed) {
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      const hash = await argon2.hash(password);
      return new Password(hash, true);
    }
    return new Password(password, true);
  }

  public async compare(plainText: string): Promise<boolean> {
    if (!this.isHashed) return false;
    return argon2.verify(this.value, plainText);
  }
}
