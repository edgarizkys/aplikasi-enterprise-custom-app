const request = require('supertest');
const app = require('../app');

describe('ERP API Endpoints', () => {
  
  describe('GET /api/employees', () => {
    it('fetch all employees with pagination', async () => {
      const res = await request(app).get('/api/employees?page=1&limit=10');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/employees', () => {
    it('create new employee record', async () => {
      const newEmp = { name: 'Budi Test', role: 'Staff', department: 'HR', salary: 5000000 };
      const res = await request(app).post('/api/employees').send(newEmp);
      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe(newEmp.name);
    });
  });

  describe('GET /api/projects', () => {
    it('fetch project list', async () => {
      const res = await request(app).get('/api/projects');
      expect(res.statusCode).toBe(200);
      expect(res.body.data[0]).toHaveProperty('title');
    });
  });

  describe('Error Handling', () => {
    it('return 404 for non-existent route', async () => {
      const res = await request(app).get('/api/invalid-path');
      expect(res.statusCode).toBe(404);
    });

    it('return 400 for invalid salary input', async () => {
      const res = await request(app).post('/api/employees').send({ name: 'Fail', salary: 'abc' });
      expect(res.statusCode).toBe(400);
    });
  });
});