const db = require('../database/db');

const getUsers = (req, res) => {
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const mappedUsers = rows.map((u, index) => ({
            id: u.id,
            name: u.login,
            age: 20 + (u.id % 5),
            match: 80 + (u.id % 19),
            avatar: `img/avatar${(index % 3) + 1}.png`,
            wantsToSee: "Супер Марио"
        }));
        res.json(mappedUsers);
    });
};

module.exports = { getUsers };