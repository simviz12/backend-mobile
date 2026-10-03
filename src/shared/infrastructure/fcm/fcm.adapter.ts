import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import type { IPushNotificationPort, PushNotificationPayload } from '../../application/ports/push-notification.port';

@Injectable()
export class FcmAdapter implements IPushNotificationPort {
  private readonly logger = new Logger(FcmAdapter.name);
  private initialized = false;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    if (admin.apps.length === 0) {
      try {
        // En producción las credenciales vendrían de variables de entorno o archivo de cuenta de servicio
        // Aquí mockeamos o inicializamos si existe la variable
        const serviceAccountPath = process.env.FIREBASE_CREDENTIALS;
        
        if (serviceAccountPath) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccountPath),
          });
          this.initialized = true;
          this.logger.log('Firebase Admin initialized successfully');
        } else {
          this.logger.warn('FIREBASE_CREDENTIALS not provided. FCM will run in dry/mock mode');
        }
      } catch (error) {
        this.logger.error('Failed to initialize Firebase Admin', error);
      }
    } else {
      this.initialized = true;
    }
  }

  async send(payload: PushNotificationPayload): Promise<boolean> {
    if (!this.initialized) {
      this.logger.warn(`Mock sending FCM to ${payload.token}: ${JSON.stringify(payload.data)}`);
      return true; // Simulate success if not initialized
    }

    try {
      const message: admin.messaging.Message = {
        token: payload.token,
        data: payload.data,
        android: {
          priority: payload.priority === 'high' ? 'high' : 'normal',
          ttl: payload.ttl ? payload.ttl * 1000 : 3600000, // Default 1 hour
        },
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`FCM sent successfully: ${response}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Error sending FCM: ${error.message}`, error.stack);
      return false;
    }
  }
}
