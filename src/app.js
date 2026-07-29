const express = require('express');
const { createClient } = require('@libsql/client');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

const handleError = (res, err) => {
  console.error(err);
  res.status(500).json({ error: 'Database failure' });
};

app.get('/api/:table', async (req, res) => {
  const { table } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const result = await db.execute({
      sql: `SELECT * FROM ${table} LIMIT ? OFFSET ?`,
      args: [Number(limit), Number(offset)]
    });
    res.json(result.rows);
  } catch (err) {
    handleError(res, err);
  }
});

app.post('/api/:table', async (req, res) => {
  const { table } = req.params;
  const keys = Object.keys(req.body);
  const values = Object.values(req.body);
  const placeholders = keys.map(() => '?').join(',');

  try {
    await db.execute({
      sql: `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`,
      args: values
    });
    res.status(201).json({ message: 'Data tersimpan' });
  } catch (err) {
    handleError(res, err);
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));