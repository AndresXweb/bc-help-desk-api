import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key]!.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('GET /api/v1/users/dashboard', () => {
  it('should return 401 without a token', async () => {
    const res = await request(app).get('/api/v1/users/dashboard');
    expect(res.status).toBe(401);
  });

  it('should return 200 with the authenticated user info', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Alice', email: 'alice@test.com', password: 'Password1!' });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'alice@test.com', password: 'Password1!' });

    const token = loginRes.body.accessToken as string;

    const res = await request(app)
      .get('/api/v1/users/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ email: 'alice@test.com', role: 'user' });
  });
});
