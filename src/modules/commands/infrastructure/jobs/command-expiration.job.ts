import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { CommandStatus } from '@prisma/client';

@Injectable()
export class CommandExpirationJob {
  private readonly logger = new Logger(CommandExpirationJob.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.debug('Running Command Expiration Job...');

    // Let's say commands expire after 1 hour (3600 seconds)
    const expirationThreshold = new Date(Date.now() - 3600 * 1000);

    const result = await this.prisma.command.updateMany({
      where: {
        status: { in: [CommandStatus.PENDING, CommandStatus.SENT] },
        createdAt: { lt: expirationThreshold },
      },
      data: {
        status: CommandStatus.EXPIRED,
      },
    });

    if (result.count > 0) {
      this.logger.log(`Expired ${result.count} commands.`);
    }
  }
}
