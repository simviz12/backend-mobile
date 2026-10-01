import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { User, UserProps } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.value-object';
import { Password } from '../../domain/value-objects/password.value-object';

// Note: Usually we inject a PrismaService here.
// For now, to keep it simple and compilable, we'll implement it and assume PrismaService is injected.

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  // constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<void> {
    // await this.prisma.user.create({ data: { id: user.id, email: user.email.value, password: user.password.value, createdAt: user.createdAt } })
    throw new Error('Method not implemented.');
  }

  async findByEmail(email: Email): Promise<User | null> {
    // const userData = await this.prisma.user.findUnique({ where: { email: email.value } })
    // if (!userData) return null;
    // return User.create({ id: userData.id, email: Email.create(userData.email), password: await Password.create(userData.password, true), createdAt: userData.createdAt })
    throw new Error('Method not implemented.');
  }

  async findById(id: string): Promise<User | null> {
    throw new Error('Method not implemented.');
  }
}
