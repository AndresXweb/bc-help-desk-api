import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import bcrypt from 'bcrypt';
import { app } from '../app';
import { User } from '../models/user.model';

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

// Helper: el endpoint público /register siempre crea role "user" —
// para probar rutas de admin insertamos el usuario admin directo en Mongo
// (igual que hace el seed de server.ts) y luego iniciamos sesión normalmente.
async function loginAs(role: 'user' | 'admin', email: string): Promise<string> {
  const password = 'Password1!';
  const hashed = await bcrypt.hash(password, 1); // rounds=1 → tests rápidos

  await User.create({ name: `Test ${role}`, email, password: hashed, role });

  const res = await request(app).post('/api/v1/auth/login').send({ email, password });
  return res.body.accessToken as string;
}

const validTicket = {
  code: 'TKT-1001',
  title: 'Impresora no funciona',
  description: 'La impresora del piso 3 no responde',
  estimatedHours: 2,
};

describe('POST /api/v1/tickets', () => {
  it('should return 401 without a token', async () => {
    const res = await request(app).post('/api/v1/tickets').send(validTicket);
    expect(res.status).toBe(401);
  });

  it('should return 201 and create the ticket for an authenticated user', async () => {
    const token = await loginAs('user', 'user1@test.com');

    const res = await request(app)
      .post('/api/v1/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send(validTicket);

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ code: 'TKT-1001', status: 'open' });
  });

  it('should return 400 (validation) when a required field is missing', async () => {
    const token = await loginAs('user', 'user1@test.com');

    const res = await request(app)
      .post('/api/v1/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: 'TKT-1001', title: 'ok' }); // falta description y estimatedHours

    expect(res.status).toBe(400);
  });

  it('should return 409 when the ticket code already exists', async () => {
    const token = await loginAs('user', 'user1@test.com');

    await request(app)
      .post('/api/v1/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send(validTicket);

    const res = await request(app)
      .post('/api/v1/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send(validTicket);

    expect(res.status).toBe(409);
  });
});

describe('GET /api/v1/tickets', () => {
  it('should return 401 without a token', async () => {
    const res = await request(app).get('/api/v1/tickets');
    expect(res.status).toBe(401);
  });

  it('should return 200 with the list of tickets', async () => {
    const token = await loginAs('user', 'user1@test.com');
    await request(app)
      .post('/api/v1/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send(validTicket);

    const res = await request(app).get('/api/v1/tickets').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('GET /api/v1/tickets/:id', () => {
  it('should return 200 with the ticket when it exists', async () => {
    const token = await loginAs('user', 'user1@test.com');
    const createRes = await request(app)
      .post('/api/v1/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send(validTicket);

    const res = await request(app)
      .get(`/api/v1/tickets/${createRes.body.data._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ code: 'TKT-1001' });
  });

  it('should return 404 when the ticket does not exist', async () => {
    const token = await loginAs('user', 'user1@test.com');

    const res = await request(app)
      .get('/api/v1/tickets/507f1f77bcf86cd799439011') // ObjectId válido pero inexistente
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/v1/tickets/:id', () => {
  it('should return 200 when the owner updates their own ticket', async () => {
    const token = await loginAs('user', 'user1@test.com');
    const createRes = await request(app)
      .post('/api/v1/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send(validTicket);

    const res = await request(app)
      .patch(`/api/v1/tickets/${createRes.body.data._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'in_progress' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('in_progress');
  });

  it('should return 200 when an admin updates a ticket they do not own', async () => {
    const userToken = await loginAs('user', 'user1@test.com');
    const createRes = await request(app)
      .post('/api/v1/tickets')
      .set('Authorization', `Bearer ${userToken}`)
      .send(validTicket);

    const adminToken = await loginAs('admin', 'admin1@test.com');

    const res = await request(app)
      .patch(`/api/v1/tickets/${createRes.body.data._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'closed' });

    expect(res.status).toBe(200);
  });

  it('should return 403 when a non-owner, non-admin tries to update the ticket', async () => {
    const ownerToken = await loginAs('user', 'user1@test.com');
    const createRes = await request(app)
      .post('/api/v1/tickets')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(validTicket);

    const otherToken = await loginAs('user', 'user2@test.com');

    const res = await request(app)
      .patch(`/api/v1/tickets/${createRes.body.data._id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ status: 'closed' });

    expect(res.status).toBe(403);
  });

  it('should return 404 when the ticket does not exist', async () => {
    const token = await loginAs('user', 'user1@test.com');

    const res = await request(app)
      .patch('/api/v1/tickets/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'closed' });

    expect(res.status).toBe(404);
  });

  it('should return 400 (validation) when status is not one of the allowed values', async () => {
    const token = await loginAs('user', 'user1@test.com');
    const createRes = await request(app)
      .post('/api/v1/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send(validTicket);

    const res = await request(app)
      .patch(`/api/v1/tickets/${createRes.body.data._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'not-a-real-status' });

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/v1/tickets/:id', () => {
  it('should return 403 when a non-admin tries to delete a ticket', async () => {
    const userToken = await loginAs('user', 'user1@test.com');
    const createRes = await request(app)
      .post('/api/v1/tickets')
      .set('Authorization', `Bearer ${userToken}`)
      .send(validTicket);

    const res = await request(app)
      .delete(`/api/v1/tickets/${createRes.body.data._id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it('should return 200 when an admin deletes the ticket', async () => {
    const userToken = await loginAs('user', 'user1@test.com');
    const createRes = await request(app)
      .post('/api/v1/tickets')
      .set('Authorization', `Bearer ${userToken}`)
      .send(validTicket);

    const adminToken = await loginAs('admin', 'admin1@test.com');

    const res = await request(app)
      .delete(`/api/v1/tickets/${createRes.body.data._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it('should return 404 when admin deletes a non-existent ticket', async () => {
    const adminToken = await loginAs('admin', 'admin404@test.com');

    const res = await request(app)
      .delete('/api/v1/tickets/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});