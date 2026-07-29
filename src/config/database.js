// config/database.js
const { createClient } = require('@libsql/client');

const tursoClient = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

async function initializeDatabase() {
    try {
        await tursoClient.execute(`
            CREATE TABLE IF NOT EXISTS employees (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tenant_id TEXT DEFAULT 'default',
                name TEXT NOT NULL,
                role TEXT,
                department TEXT,
                salary REAL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await tursoClient.execute(`
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tenant_id TEXT DEFAULT 'default',
                title TEXT NOT NULL,
                budget REAL,
                deadline TEXT,
                status TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('[DB] Schema initialized: employees, projects');
    } catch(e) {
        console.error('[DB] Init error:', e.message);
        process.exit(1);
    }
}

module.exports = { tursoClient, initializeDatabase };