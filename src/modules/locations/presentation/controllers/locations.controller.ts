import { Controller, Post, Get, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RecordLocationUseCase } from '../../application/use-cases/record-location.use-case';
import { GetLocationsUseCase } from '../../application/use-cases/get-locations.use-case';
import { CreateLocationDto } from '../../application/dtos/create-location.dto';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';

@ApiTags('Locations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('devices/:deviceId/locations')
export class LocationsController {
  constructor(
    private readonly recordLocationUseCase: RecordLocationUseCase,
    private readonly getLocationsUseCase: GetLocationsUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record a new location for a device' })
  async recordLocation(
    @CurrentUser() user: { id: string },
    @Param('deviceId') deviceId: string,
    @Body() dto: CreateLocationDto,
  ) {
    const loc = await this.recordLocationUseCase.execute(user.id, deviceId, dto);
    return {
      id: loc.id,
      deviceId: loc.deviceId,
      lat: loc.lat,
      lng: loc.lng,
      accuracy: loc.accuracy,
      recordedAt: loc.recordedAt,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get location history for a device' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'from', required: false, type: String, description: 'ISO date' })
  @ApiQuery({ name: 'to', required: false, type: String, description: 'ISO date' })
  async getLocations(
    @CurrentUser() user: { id: string },
    @Param('deviceId') deviceId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 20;
    const result = await this.getLocationsUseCase.execute(user.id, deviceId, p, l, from, to);
    return {
      data: result.data.map((loc) => ({
        id: loc.id,
        lat: loc.lat,
        lng: loc.lng,
        accuracy: loc.accuracy,
        recordedAt: loc.recordedAt,
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
