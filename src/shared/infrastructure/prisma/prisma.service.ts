import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDb() {
    if (process.env.NODE_ENV === 'test') {
      const models = Reflect.ownKeys(this).filter((key) => key[0] !== '_');
      return Promise.all(
        models.map((modelKey) => {
          if (this[modelKey as string]?.deleteMany) {
            return this[modelKey as string].deleteMany();
          }
        }),
      );
    }
  }
}
