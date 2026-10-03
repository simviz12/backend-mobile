import { Injectable } from '@nestjs/common';
import { IAuditRepository } from '../../domain/repositories/audit.repository.interface';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class PrismaAuditRepository implements IAuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async log(data: {
    userId: string;
    targetDeviceId: string;
    sourceDeviceId?: string;
    action: string;
    status: string;
    details?: any;
  }): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        targetDeviceId: data.targetDeviceId,
        sourceDeviceId: data.sourceDeviceId,
        action: data.action,
        status: data.status,
        details: data.details ? data.details : null,
      }
    });
  }
}
