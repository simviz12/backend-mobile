import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DevicesModule } from './modules/devices/devices.module';
import { CommandsModule } from './modules/commands/commands.module';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module';

@Module({
  imports: [AuthModule, UsersModule, DevicesModule, CommandsModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
