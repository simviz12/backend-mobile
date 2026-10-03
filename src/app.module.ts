import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DevicesModule } from './modules/devices/devices.module';
import { CommandsModule } from './modules/commands/commands.module';
import { LocationsModule } from './modules/locations/locations.module';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module';
import { WebsocketsModule } from './shared/infrastructure/websockets/websockets.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    DevicesModule,
    CommandsModule,
    LocationsModule,
    PrismaModule,
    WebsocketsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
