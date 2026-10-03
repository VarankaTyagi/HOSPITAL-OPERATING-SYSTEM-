import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('HospitalOS End-to-End Suite (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/digital-twin/state - returns real-time operational digital twin payload', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/digital-twin/state')
      .expect(200);

    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('digitalTwin');
    expect(response.body.digitalTwin).toHaveProperty('queues');
    expect(response.body.digitalTwin).toHaveProperty('beds');
    expect(response.body.digitalTwin).toHaveProperty('bottlenecks');
  });

  it('GET /api/departments - lists hospital clinical departments', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/departments')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('GET /api/queues - returns real-time queue states with tickets', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/queues')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('GET /api/beds - returns bed occupancy matrix', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/beds')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('POST /api/auth/login - authenticates administrator and returns JWT token', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'admin@hospitalos.org',
        password: 'Password123!',
      })
      .expect(200);

    expect(response.body).toHaveProperty('access_token');
    expect(response.body.user).toHaveProperty('role', 'ADMIN');
  });
});
