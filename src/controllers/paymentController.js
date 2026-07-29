// controllers/paymentController.js
const paymentService = require('../services/paymentService');
const { createClient } = require('@libsql/client');

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

exports.processPayment = async (req, res) => {
    try {
        const { orderId, amount, method, bank, tenantId } = req.body;
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID wajib' });

        let result;
        if (method === 'QRIS') {
            result = await paymentService.createQrisTransaction(orderId, amount);
        } else if (method === 'VA') {
            result = await paymentService.createVirtualAccountTransaction(orderId, amount, bank);
        } else {
            return res.status(400).json({ error: 'Metode tidak valid' });
        }

        await db.execute({
            sql: 'INSERT INTO payments (tenant_id, order_id, amount, status, provider_ref) VALUES (?, ?, ?, ?, ?)',
            args: [tenantId, orderId, amount, 'pending', result.referenceNo || result.vaNumber]
        });

        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: 'Gagal proses pembayaran' });
    }
};

exports.handleWebhook = async (req, res) => {
    const signature = req.headers['x-payment-signature'];
    if (!paymentService.verifyWebhookSignature(req.body, signature)) {
        return res.status(403).json({ error: 'Signature tidak valid' });
    }

    const { orderId, status } = req.body;
    try {
        await db.execute({
            sql: 'UPDATE payments SET status = ? WHERE order_id = ?',
            args: [status, orderId]
        });
        res.sendStatus(200);
    } catch (err) {
        res.status(500).json({ error: 'Gagal update status' });
    }
};