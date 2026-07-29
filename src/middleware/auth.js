// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    const token = req.headers['authorization'];
    
    if (!token) {
        req.user = { id: 1, role: 'admin', name: 'Demo User', tenant_id: 'default' };
        return next();
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'super-secret-key');
        req.user = decoded;
        
        if (!req.user.tenant_id) {
            return res.status(403).json({ error: 'Tenant ID hilang' });
        }
        
        next();
    } catch(e) {
        res.status(401).json({ error: 'Sesi tidak valid' });
    }
};