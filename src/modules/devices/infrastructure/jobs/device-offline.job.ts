import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { EVENT_PUBLISHER_PORT } from '../../../../shared/application/ports/event-publisher.port';
import type { IEventPublisherPort } from '../../../../shared/application/ports/event-publisher.port';

@Injectable()
export class DeviceOfflineJob {
  private readonly logger = new Logger(DeviceOfflineJob.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(EVENT_PUBLISHER_PORT) private readonly eventPublisher: IEventPublisherPort,
  ) {}

  // Run every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.debug('Running Device Offline Job...');

    // Let's say a device is offline if not seen in 5 minutes
    const offlineThreshold = new Date(Date.now() - 5 * 60 * 1000);

    const devicesToMark = await this.prisma.device.findMany({
      where: {
        lastSeenAt: { lt: offlineThreshold },
        isOnline: true,isTheftModeActive: false,
      },
    });

    if (devicesToMark.length > 0) {
      await this.prisma.device.updateMany({
        where: { id: { in: devicesToMark.map(d => d.id) } },
        data: { isOnline: false, isTheftModeActive: false },
      });

      for (const device of devicesToMark) {
        this.eventPublisher.publishToUser(device.ownerId, 'device.offline', { deviceId: device.id });
      }

      this.logger.log(`Marked ${devicesToMark.length} devices as offline.`);
    }
  }
}
