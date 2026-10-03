import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { EVENT_PUBLISHER_PORT } from '../../../../shared/application/ports/event-publisher.port';
import type { IEventPublisherPort } from '../../../../shared/application/ports/event-publisher.port';
import { CommandStatus } from '@prisma/client';

@Injectable()
export class CommandExpirationJob {
  private readonly logger = new Logger(CommandExpirationJob.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(EVENT_PUBLISHER_PORT) private readonly eventPublisher: IEventPublisherPort,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.debug('Running Command Expiration Job...');

    // Let's say commands expire after 1 hour (3600 seconds)
    const expirationThreshold = new Date(Date.now() - 3600 * 1000);

    const expiredCommands = await this.prisma.command.findMany({
      where: {
        status: { in: [CommandStatus.PENDING, CommandStatus.SENT] },
        createdAt: { lt: expirationThreshold },
      },
      include: { targetDevice: true },
    });

    if (expiredCommands.length > 0) {
      await this.prisma.command.updateMany({
        where: { id: { in: expiredCommands.map(c => c.id) } },
        data: { status: CommandStatus.EXPIRED },
      });

      for (const cmd of expiredCommands) {
        if (cmd.targetDevice?.ownerId) {
          this.eventPublisher.publishToUser(cmd.targetDevice.ownerId, 'command.updated', {
            id: cmd.id,
            status: CommandStatus.EXPIRED,
          });
        }
      }

      this.logger.log(`Expired ${expiredCommands.length} commands.`);
    }
  }
}
