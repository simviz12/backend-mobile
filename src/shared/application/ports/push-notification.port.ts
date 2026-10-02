export const PUSH_NOTIFICATION_PORT = Symbol('PUSH_NOTIFICATION_PORT');

export interface PushNotificationPayload {
  token: string;
  data: Record<string, string>;
  priority?: 'high' | 'normal';
  ttl?: number;
}

export interface IPushNotificationPort {
  send(payload: PushNotificationPayload): Promise<boolean>;
}
