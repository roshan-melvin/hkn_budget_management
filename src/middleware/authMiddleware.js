const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';
const COOKIE_NAME = process.env.COOKIE_NAME || 'hb_token';

const requireAuth = (req, res, next) => {
    const token = req.cookies && req.cookies[COOKIE_NAME];
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = { id: payload.id };
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = requireAuth;
