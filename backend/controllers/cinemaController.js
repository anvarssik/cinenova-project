const db = require('../database/db');

const getCinemas = (req, res) => {
    db.all('SELECT * FROM cinemas', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
};

module.exports = { getCinemas };