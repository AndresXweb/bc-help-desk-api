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
  // Estado limpio entre tests — cada `it` empieza con la DB vacía
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key]!.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('GET /api/v1/health', () => {
  it('should return 200 with status ok', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toEqual(expect.any(String));
  });
});

describe('POST /api/v1/auth/register', () => {
  it('should return 201 and the created user (without password) on valid data', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Alice',
      email: 'alice@test.com',
      password: 'Password1!',
    });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ email: 'alice@test.com', role: 'user' });
    expect(res.body.data.password).toBeUndefined();
  });

  it('should return 409 when the email is already registered', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Alice', email: 'alice@test.com', password: 'Password1!' });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Alice 2', email: 'alice@test.com', password: 'Password1!' });

    expect(res.status).toBe(409);
  });

  it('should return 400 (validation) when the password is too weak', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Alice', email: 'alice@test.com', password: 'weak' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Alice', email: 'alice@test.com', password: 'Password1!' });
  });

  it('should return 200 and an accessToken on valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'alice@test.com', password: 'Password1!' });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toEqual(expect.any(String));
  });

  it('should return 401 on wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'alice@test.com', password: 'WrongPass1!' });

    expect(res.status).toBe(401);
  });

  it('should let the returned token access GET /auth/me', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'alice@test.com', password: 'Password1!' });

    const token = loginRes.body.accessToken as string;

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.email).toBe('alice@test.com');
  });
});

describe('GET /api/v1/auth/me', () => {
  it('should return 401 without an Authorization header', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('should return 401 with an invalid token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer not-a-valid-jwt');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/auth/refresh', () => {
  it('should return 401 without a refresh token cookie', async () => {
    const res = await request(app).post('/api/v1/auth/refresh');
    expect(res.status).toBe(401);
  });

  it('should return 200 and a new accessToken with a valid refresh cookie', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Alice', email: 'alice@test.com', password: 'Password1!' });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'alice@test.com', password: 'Password1!' });

    const cookie = loginRes.headers['set-cookie'];

    const res = await request(app).post('/api/v1/auth/refresh').set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toEqual(expect.any(String));
  });
});

describe('POST /api/v1/auth/logout', () => {
  it('should return 401 without a token', async () => {
    const res = await request(app).post('/api/v1/auth/logout');
    expect(res.status).toBe(401);
  });

  it('should return 200 and clear the session for an authenticated user', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Alice', email: 'alice@test.com', password: 'Password1!' });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'alice@test.com', password: 'Password1!' });

    const token = loginRes.body.accessToken as string;

    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});

describe('unknown route', () => {
  it('should return 404 for a route that does not exist', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');
    expect(res.status).toBe(404);
  });
});