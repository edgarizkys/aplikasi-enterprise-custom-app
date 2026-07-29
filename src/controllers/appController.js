// controllers/appController.js
const { tursoClient } = require('../config/database');

const getTenant = (req) => req.headers['x-tenant-id'] || 'default_tenant';

exports.getItems = async (req, res) => {
    try {
        const { entity } = req.params;
        const tenantId = getTenant(req);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const data = await tursoClient.execute({
            sql: `SELECT * FROM ${entity} WHERE tenant_id = ? LIMIT ? OFFSET ?`,
            args: [tenantId, limit, offset]
        });

        const count = await tursoClient.execute({
            sql: `SELECT COUNT(*) as total FROM ${entity} WHERE tenant_id = ?`,
            args: [tenantId]
        });

        res.json({
            success: true,
            data: data.rows,
            pagination: { page, limit, total: count.rows[0].total }
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.createItem = async (req, res) => {
    try {
        const { entity } = req.params;
        const tenantId = getTenant(req);
        const keys = Object.keys(req.body);
        const values = Object.values(req.body);
        
        const sql = `INSERT INTO ${entity} (tenant_id, ${keys.join(', ')}) VALUES (?, ${keys.map(() => '?').join(', ')})`;
        const result = await tursoClient.execute({
            sql,
            args: [tenantId, ...values]
        });

        res.status(201).json({ success: true, id: Number(result.lastInsertRowid) });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

exports.updateItem = async (req, res) => {
    try {
        const { entity, id } = req.params;
        const tenantId = getTenant(req);
        const keys = Object.keys(req.body);
        const setClause = keys.map(k => `${k} = ?`).join(', ');
        
        await tursoClient.execute({
            sql: `UPDATE ${entity} SET ${setClause} WHERE id = ? AND tenant_id = ?`,
            args: [...Object.values(req.body), id, tenantId]
        });

        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        const { entity, id } = req.params;
        const tenantId = getTenant(req);
        
        await tursoClient.execute({
            sql: `DELETE FROM ${entity} WHERE id = ? AND tenant_id = ?`,
            args: [id, tenantId]
        });

        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};