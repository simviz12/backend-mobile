import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module';

@Module({
  imports: [AuthModule, UsersModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
