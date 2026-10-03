import { Module, Global } from '@nestjs/common';
import { AUDIT_REPOSITORY } from './domain/repositories/audit.repository.interface';
import { PrismaAuditRepository } from './infrastructure/repositories/prisma-audit.repository';

@Global()
@Module({
  providers: [
    {
      provide: AUDIT_REPOSITORY,
      useClass: PrismaAuditRepository,
    },
  ],
  exports: [AUDIT_REPOSITORY],
})
export class AuditModule {}
