import { Injectable } from '@nestjs/common';
import type { IDeviceRepository } from '../../domain/repositories/device.repository.interface';
import { Device, DeviceMode } from '../../domain/entities/device.entity';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { DeviceMode as PrismaDeviceMode } from '@prisma/client';

@Injectable()
export class PrismaDeviceRepository implements IDeviceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(device: Device): Promise<void> {
    await this.prisma.device.upsert({
      where: { id: device.id },
      update: {
        name: device.name,
        fcmToken: device.fcmToken,
        lastSeenAt: device.lastSeenAt,
      },
      create: {
        id: device.id,
        ownerId: device.ownerId,
        name: device.name,
        mode: device.mode as PrismaDeviceMode,
        platform: device.platform,
        fcmToken: device.fcmToken,
        lastSeenAt: device.lastSeenAt,
        createdAt: device.createdAt,
      },
    });
  }

  async findById(id: string): Promise<Device | null> {
    const raw = await this.prisma.device.findUnique({ where: { id } });
    if (!raw) return null;
    return Device.create({
      id: raw.id,
      ownerId: raw.ownerId,
      name: raw.name,
      mode: raw.mode as DeviceMode,
      platform: raw.platform,
      fcmToken: raw.fcmToken,
      lastSeenAt: raw.lastSeenAt,
      createdAt: raw.createdAt,
    });
  }

  async findByOwnerId(ownerId: string): Promise<Device[]> {
    const rawList = await this.prisma.device.findMany({ where: { ownerId } });
    return rawList.map((raw) =>
      Device.create({
        id: raw.id,
        ownerId: raw.ownerId,
        name: raw.name,
        mode: raw.mode as DeviceMode,
        platform: raw.platform,
        fcmToken: raw.fcmToken,
        lastSeenAt: raw.lastSeenAt,
        createdAt: raw.createdAt,
      }),
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.device.delete({ where: { id } });
  }
}
