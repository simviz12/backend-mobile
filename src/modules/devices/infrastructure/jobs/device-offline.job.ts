import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class DeviceOfflineJob {
  private readonly logger = new Logger(DeviceOfflineJob.name);

  constructor(private readonly prisma: PrismaService) {}

  // Run every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.debug('Running Device Offline Job...');

    // Let's say a device is offline if not seen in 5 minutes
    const offlineThreshold = new Date(Date.now() - 5 * 60 * 1000);

    const result = await this.prisma.device.updateMany({
      where: {
        lastSeenAt: { lt: offlineThreshold },
        isOnline: true,
      },
      data: {
        isOnline: false,
      },
    });

    if (result.count > 0) {
      this.logger.log(`Marked ${result.count} devices as offline.`);
    }
  }
}
