const db = require('../database/db');

const checkAdmin = (req, res, next) => {
    const userEmail = req.headers['x-user-email'];

    if (!userEmail) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    db.get('SELECT role FROM users WHERE email = ?', [userEmail], (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        next();
    });
};

module.exports = { checkAdmin };