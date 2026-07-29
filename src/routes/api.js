// controllers/erpController.js
const { tursoClient } = require('../config/database');

const getTenant = (req) => req.headers['x-tenant-id'] || 'default_tenant';

exports.getItems = async (req, res) => {
    try {
        const { entity } = req.params;
        const tenant = getTenant(req);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const data = await tursoClient.execute({
            sql: `SELECT * FROM ${entity} WHERE tenant_id = ? LIMIT ? OFFSET ?`,
            args: [tenant, limit, offset]
        });

        const count = await tursoClient.execute({
            sql: `SELECT COUNT(*) as total FROM ${entity} WHERE tenant_id = ?`,
            args: [tenant]
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
        const tenant = getTenant(req);
        const keys = Object.keys(req.body);
        const values = Object.values(req.body);
        
        const sql = `INSERT INTO ${entity} (tenant_id, ${keys.join(', ')}) VALUES (?, ${keys.map(() => '?').join(', ')})`;
        const result = await tursoClient.execute({
            sql,
            args: [tenant, ...values]
        });

        res.status(201).json({ success: true, id: Number(result.lastInsertRowid) });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

// routes/api.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/erpController');

router.get('/:entity', ctrl.getItems);
router.post('/:entity', ctrl.createItem);

module.exports = router;

// frontend/components/Table.jsx
const ERPTable = ({ data, columns }) => (
    <div className="overflow-x-auto bg-[#1E293B] p-4 rounded-lg">
        <table className="w-full text-white">
            <thead>
                <tr>
                    {columns.map(c => <th key={c.key} className="p-2 border-b border-[#3B82F6]">{c.label}</th>)}
                </tr>
            </thead>
            <tbody>
                {data.map((row, i) => (
                    <tr key={i}>
                        {columns.map(c => <td key={c.key} className="p-2">{row[c.key]}</td>)}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);