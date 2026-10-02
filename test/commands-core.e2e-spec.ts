import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/infrastructure/prisma/prisma.service';

describe('Commands Core (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let deviceId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    
    // Cleanup
    await prisma.command.deleteMany();
    await prisma.device.deleteMany();
    await prisma.user.deleteMany();

    // Setup user and device
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'commanduser2@example.com', password: 'password123' });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'commanduser2@example.com', password: 'password123' });

    accessToken = loginRes.body.accessToken;

    const deviceRes = await request(app.getHttpServer())
      .post('/devices')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'My Target Phone',
        mode: 'PROTECTED',
        platform: 'Android',
      });
      
    deviceId = deviceRes.body.id;
  });

  afterAll(async () => {
    await prisma.command.deleteMany();
    await prisma.device.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  it('/devices/:deviceId/commands (POST) - should create command', async () => {
    const response = await request(app.getHttpServer())
      .post(`/devices/${deviceId}/commands`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        commandType: 'RING'
      })
      .expect(202);

    expect(response.body.id).toBeDefined();
    expect(response.body.status).toBe('PENDING');
    expect(response.body.commandType).toBe('RING');
    expect(response.body.targetDeviceId).toBe(deviceId);
  });
});
