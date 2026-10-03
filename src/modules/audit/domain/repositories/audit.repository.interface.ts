export const AUDIT_REPOSITORY = 'AUDIT_REPOSITORY';

export interface IAuditRepository {
  log(data: {
    userId: string;
    targetDeviceId: string;
    sourceDeviceId?: string;
    action: string;
    status: string;
    details?: any;
  }): Promise<void>;
}
