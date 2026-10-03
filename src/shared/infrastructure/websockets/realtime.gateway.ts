import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import type { IEventPublisherPort } from '../../application/ports/event-publisher.port';

@Injectable()
@WebSocketGateway({
  namespace: '/realtime',
  cors: { origin: '*' },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect, IEventPublisherPort {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      this.logger.warn(`Client disconnected (no token): ${client.id}`);
      client.disconnect();
      return;
    }

    try {
      // In a real scenario, use ConfigService for the secret
      const secret = process.env.JWT_SECRET || 'super-secret-key';
      const decoded = jwt.verify(token, secret) as any;
      
      const userId = decoded.sub; // User ID from token
      
      // Join user-specific room
      client.join(`user:${userId}`);
      
      // If it's a device connecting, it could also join a device room
      // But usually devices authenticate as users in this setup. We might need a device claim.
      if (decoded.deviceId) {
        client.join(`device:${decoded.deviceId}`);
      }

      this.logger.log(`Client connected: ${client.id} to user:${userId}`);
    } catch (error) {
      this.logger.warn(`Client disconnected (invalid token): ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  publishToUser(userId: string, event: string, payload: any): void {
    this.server.to(`user:${userId}`).emit(event, payload);
    this.logger.debug(`Published ${event} to user:${userId}`);
  }

  publishToDevice(deviceId: string, event: string, payload: any): void {
    this.server.to(`device:${deviceId}`).emit(event, payload);
    this.logger.debug(`Published ${event} to device:${deviceId}`);
  }
}
