import { Injectable } from '@nestjs/common';
import { ITheftModeLogRepository } from '../../domain/repositories/theft-mode-log.repository.interface';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class PrismaTheftModeLogRepository implements ITheftModeLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async logAction(deviceId: string, action: 'ACTIVATED' | 'DEACTIVATED', reason?: string): Promise<void> {
    await this.prisma.theftModeLog.create({
      data: {
        deviceId,
        action,
        reason,
      },
    });
  }

  async getLogsByDeviceId(deviceId: string): Promise<any[]> {
    return this.prisma.theftModeLog.findMany({
      where: { deviceId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
