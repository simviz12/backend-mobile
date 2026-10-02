import { Injectable } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.value-object';
import { Password } from '../../domain/value-objects/password.value-object';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email.value,
        password: user.password.value,
      },
      create: {
        id: user.id,
        email: user.email.value,
        password: user.password.value,
        createdAt: user.createdAt,
      },
    });
  }

  async findByEmail(email: Email): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({ where: { email: email.value } });
    if (!userData) return null;
    return User.create({ 
      id: userData.id, 
      email: Email.create(userData.email), 
      password: await Password.create(userData.password, true), 
      createdAt: userData.createdAt 
    });
  }

  async findById(id: string): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({ where: { id } });
    if (!userData) return null;
    return User.create({ 
      id: userData.id, 
      email: Email.create(userData.email), 
      password: await Password.create(userData.password, true), 
      createdAt: userData.createdAt 
    });
  }
}
