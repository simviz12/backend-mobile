import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DevicesModule } from './modules/devices/devices.module';
import { CommandsModule } from './modules/commands/commands.module';
import { LocationsModule } from './modules/locations/locations.module';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module';
import { WebsocketsModule } from './shared/infrastructure/websockets/websockets.module';
import { TheftModeModule } from './modules/theft-mode/theft-mode.module';
import { AuditModule } from './modules/audit/audit.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    DevicesModule,
    CommandsModule,
    LocationsModule,
    TheftModeModule,
    AuditModule,
    PrismaModule,
    WebsocketsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule {}
