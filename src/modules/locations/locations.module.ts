import { Module } from '@nestjs/common';
import { LocationsController } from './presentation/controllers/locations.controller';
import { RecordLocationUseCase } from './application/use-cases/record-location.use-case';
import { GetLocationsUseCase } from './application/use-cases/get-locations.use-case';
import { PrismaLocationRepository } from './infrastructure/repositories/prisma-location.repository';
import { LOCATION_REPOSITORY } from './domain/repositories/location.repository.interface';
import { DevicesModule } from '../devices/devices.module';

@Module({
  imports: [DevicesModule],
  controllers: [LocationsController],
  providers: [
    RecordLocationUseCase,
    GetLocationsUseCase,
    {
      provide: LOCATION_REPOSITORY,
      useClass: PrismaLocationRepository,
    },
  ],
})
export class LocationsModule {}
