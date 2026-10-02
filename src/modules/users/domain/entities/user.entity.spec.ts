import { jest } from '@jest/globals';
import { User } from './user.entity';
import { Email } from '../value-objects/email.value-object';

describe('User Entity', () => {
  it('should create user', () => {
    const email = Email.create('test@example.com');
    const password = { value: 'hashed-password', compare: jest.fn(), hash: jest.fn() } as any;

    const user = User.create({
      id: '123',
      email,
      password,
      createdAt: new Date(),
    });

    expect(user.id).toBe('123');
    expect(user.email.value).toBe('test@example.com');
    expect(user.password.value).toBe('hashed-password');
    expect(user.createdAt).toBeDefined();
  });
});
