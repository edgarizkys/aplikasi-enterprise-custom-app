require('dotenv').config();
const express = require('express');
const { createClient } = require('@libsql/client');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// DB Client Turso
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Multi-tenant Middleware
const tenantMiddleware = (req, res, next) => {
  const tenantId = req.headers['x-tenant-id'];
  if (!tenantId) {
    return res.status(400).json({ error: 'Header x-tenant-id wajib ada' });
  }
  req.tenantId = tenantId;
  next();
};

app.use('/api', tenantMiddleware);

// Helper Pagination
const getPagination = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

/**
 * EMPLOYEES ENDPOINTS
 */
app.get('/api/employees', async (req, res) => {
  try {
    const { limit, offset } = getPagination(req);
    const result = await client.execute({
      sql: 'SELECT * FROM employees WHERE tenant_id = ? LIMIT ? OFFSET ?',
      args: [req.tenantId, limit, offset],
    });
    
    const totalResult = await client.execute({
      sql: 'SELECT count(*) as total FROM employees WHERE tenant_id = ?',
      args: [req.tenantId],
    });

    res.json({
      data: result.rows,
      pagination: {
        total: totalResult.rows[0].total,
        page: (page) => Math.ceil(totalResult.rows[0].total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data karyawan', details: err.message });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const { name, role, department, salary } = req.body;
    await client.execute({
      sql: 'INSERT INTO employees (tenant_id, name, role, department, salary) VALUES (?, ?, ?, ?, ?)',
      args: [req.tenantId, name, role, department, salary],
    });
    res.status(201).json({ message: 'Karyawan berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menambah karyawan', details: err.message });
  }
});

/**
 * PROJECTS ENDPOINTS
 */
app.get('/api/projects', async (req, res) => {
  try {
    const { limit, offset } = getPagination(req);
    const result = await client.execute({
      sql: 'SELECT * FROM projects WHERE tenant_id = ? LIMIT ? OFFSET ?',
      args: [req.tenantId, limit, offset],
    });
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data proyek', details: err.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const { title, budget, deadline, status } = req.body;
    await client.execute({
      sql: 'INSERT INTO projects (tenant_id, title, budget, deadline, status) VALUES (?, ?, ?, ?, ?)',
      args: [req.tenantId, title, budget, deadline, status],
    });
    res.status(201).json({ message: 'Proyek berhasil dibuat' });
  } catch (err) {
    res.status(500).json({ error: 'Gagal membuat proyek', details: err.message });
  }
});

/**
 * REPORTING & PAYROLL (Enterprise Logic)
 */
app.get('/api/reports/departmental', async (req, res) => {
  try {
    const result = await client.execute({
      sql: 'SELECT department, SUM(salary) as total_payroll, COUNT(*) as staff_count FROM employees WHERE tenant_id = ? GROUP BY department',
      args: [req.tenantId],
    });
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Gagal generate laporan', details: err.message });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ERP Server running on port ${PORT}`);
});