const request = require('supertest');
const app = require('../../app');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

describe('NASA APIs', () => {
  it('should fetch APOD', async () => {
    const res = await request(app).get('/api/apod');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('title');
  });

  it('should reject future APOD date', async () => {
    const res = await request(app).get('/api/apod?date=2100-01-01');
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('Date cannot be in the future.');
  });

  it('should fetch Mars photos', async () => {
    const res = await request(app).get('/api/mars?sol=1000');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });

  it('should reject invalid NEO date range', async () => {
    const res = await request(app).get('/api/neo?start_date=2026-06-01&end_date=2026-06-10');
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('Date range cannot exceed 7 days.');
  });
});

describe('Favorites CRUD', () => {
  let favoriteId;

  it('should create a new favorite', async () => {
    const res = await request(app).post('/api/favorites').send({
      title: 'Test APOD',
      type: 'APOD',
      nasaId: 'test-123'
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    favoriteId = res.body.data.id;
  });

  it('should get all favorites', async () => {
    const res = await request(app).get('/api/favorites');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should update a favorite', async () => {
    const res = await request(app).patch(`/api/favorites/${favoriteId}`).send({
      notes: 'Updated notes'
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.notes).toBe('Updated notes');
  });

  it('should delete a favorite', async () => {
    const res = await request(app).delete(`/api/favorites/${favoriteId}`);
    expect(res.statusCode).toEqual(200);
  });
});
