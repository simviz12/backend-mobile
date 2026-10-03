import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/infrastructure/prisma/prisma.service';
import { PUSH_NOTIFICATION_PORT } from '../src/shared/application/ports/push-notification.port';
import { EVENT_PUBLISHER_PORT } from '../src/shared/application/ports/event-publisher.port';

describe('Week 3 Integration (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let deviceId: string;
  let mockPushPort: any;
  let mockEventPublisher: any;

  beforeAll(async () => {
    mockPushPort = { send: jest.fn().mockResolvedValue(true) };
    mockEventPublisher = {
      publishToUser: jest.fn(),
      publishToDevice: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PUSH_NOTIFICATION_PORT).useValue(mockPushPort)
      .overrideProvider(EVENT_PUBLISHER_PORT).useValue(mockEventPublisher)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    await prisma.cleanDb(); // Ensure you have a cleanDb method or clear tables

    // Register user
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'e2e-week3@test.com', password: 'Password123!' });

    // Login
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'e2e-week3@test.com', password: 'Password123!' });
    accessToken = loginRes.body.accessToken;

    // Link device
    const deviceRes = await request(app.getHttpServer())
      .post('/devices')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'My Phone', mode: 'PROTECTED', platform: 'Android', fcmToken: 'token123' });
    deviceId = deviceRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('Full flow: create command -> push sent -> ack -> event emitted', async () => {
    // 1. Create command
    const createRes = await request(app.getHttpServer())
      .post(`/devices/${deviceId}/commands`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ commandType: 'RING' })
      .expect(201);

    const commandId = createRes.body.id;
    expect(createRes.body.status).toBe('SENT'); // Because push mocked to true

    // Push should be called
    expect(mockPushPort.send).toHaveBeenCalled();
    // Event publisher should be called for creation
    expect(mockEventPublisher.publishToUser).toHaveBeenCalledWith(
      expect.any(String),
      'command.updated',
      expect.objectContaining({ id: commandId, status: 'SENT' })
    );

    // 2. Ack command
    const ackRes = await request(app.getHttpServer())
      .patch(`/devices/${deviceId}/commands/${commandId}/ack`)
      .set('Authorization', `Bearer ${accessToken}`) // Ideally device auth, but user token works for now based on rules
      .send({ status: 'EXECUTED' })
      .expect(200);

    expect(ackRes.body.status).toBe('EXECUTED');

    // Event publisher should be called for ack
    expect(mockEventPublisher.publishToUser).toHaveBeenCalledWith(
      expect.any(String),
      'command.updated',
      expect.objectContaining({ id: commandId, status: 'EXECUTED' })
    );
  });
});
