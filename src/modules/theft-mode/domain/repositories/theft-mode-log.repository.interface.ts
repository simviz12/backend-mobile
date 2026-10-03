export const THEFT_MODE_LOG_REPOSITORY = 'THEFT_MODE_LOG_REPOSITORY';

export interface ITheftModeLogRepository {
  logAction(deviceId: string, action: 'ACTIVATED' | 'DEACTIVATED', reason?: string): Promise<void>;
  getLogsByDeviceId(deviceId: string): Promise<any[]>;
}
