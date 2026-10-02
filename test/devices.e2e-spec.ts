import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/infrastructure/prisma/prisma.service';

describe('DevicesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: string;

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
    await prisma.device.deleteMany();
    await prisma.user.deleteMany();

    // Register and login to get a token
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'deviceowner@example.com', password: 'password123' })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'deviceowner@example.com', password: 'password123' })
      .expect(200);

    accessToken = loginRes.body.accessToken;
    
    // Find the user to verify ownerId
    const user = await prisma.user.findUnique({ where: { email: 'deviceowner@example.com' } });
    userId = user!.id;
  });

  afterAll(async () => {
    await prisma.device.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  it('/devices (POST) - should link a device', async () => {
    const response = await request(app.getHttpServer())
      .post('/devices')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'My Phone',
        mode: 'PROTECTED',
        platform: 'Android',
        fcmToken: 'fcm-123'
      })
      .expect(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.ownerId).toBe(userId);
    expect(response.body.name).toBe('My Phone');
    expect(response.body.mode).toBe('PROTECTED');
    expect(response.body.fcmToken).toBe('fcm-123');
  });

  it('/devices (POST) - should fail without auth', async () => {
    return request(app.getHttpServer())
      .post('/devices')
      .send({
        name: 'My Phone',
        mode: 'PROTECTED',
        platform: 'Android'
      })
      .expect(401);
  });
});
