const db = require('../database/db');

const getUsers = (req, res) => {
    db.all('SELECT id, login, email, phone FROM users', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const mappedUsers = rows.map((user, index) => {
            const avatars = ['img/avatar1.png', 'img/avatar2.png', 'img/avatar3.png'];
            const movies = ['Супер Марио', 'Шрек 5', 'Холоп 3', 'Дюна: Часть третья'];
            
            return {
                id: user.id,
                name: user.login,
                age: 18 + (user.id % 10), 
                match: 75 + (user.id % 21), 
                avatar: avatars[index % avatars.length],
                wantsToSee: movies[index % movies.length]
            };
        });

        res.json(mappedUsers);
    });
};

module.exports = { getUsers };