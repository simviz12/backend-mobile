import { Injectable } from '@nestjs/common';
import type { ILocationRepository, PaginatedLocations } from '../../domain/repositories/location.repository.interface';
import { Location } from '../../domain/entities/location.entity';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class PrismaLocationRepository implements ILocationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(location: Location): Promise<void> {
    await this.prisma.location.create({
      data: {
        id: location.id,
        deviceId: location.deviceId,
        lat: location.lat,
        lng: location.lng,
        accuracy: location.accuracy ?? null,
        recordedAt: location.recordedAt,
        createdAt: location.createdAt,
      },
    });
  }

  async findByDeviceId(
    deviceId: string,
    page: number,
    limit: number,
    from?: Date,
    to?: Date,
  ): Promise<PaginatedLocations> {
    const where: any = { deviceId };
    if (from || to) {
      where.recordedAt = {};
      if (from) where.recordedAt.gte = from;
      if (to) where.recordedAt.lte = to;
    }

    const [rawList, total] = await Promise.all([
      this.prisma.location.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { recordedAt: 'desc' },
      }),
      this.prisma.location.count({ where }),
    ]);

    const data = rawList.map((raw) =>
      Location.create({
        id: raw.id,
        deviceId: raw.deviceId,
        lat: raw.lat,
        lng: raw.lng,
        accuracy: raw.accuracy,
        recordedAt: raw.recordedAt,
        createdAt: raw.createdAt,
      }),
    );

    return { data, total, page, limit };
  }
}
