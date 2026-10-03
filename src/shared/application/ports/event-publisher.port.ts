export const EVENT_PUBLISHER_PORT = Symbol('EVENT_PUBLISHER_PORT');

export interface IEventPublisherPort {
  publishToUser(userId: string, event: string, payload: any): void;
  publishToDevice(deviceId: string, event: string, payload: any): void;
}
