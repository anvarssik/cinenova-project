const db = require('../database/db');

const getUsers = (req, res) => {
    db.all('SELECT id, login, email, phone FROM users', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

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

const registerUser = (req, res) => {
    const { login, email, phone, password } = req.body;

    if (!login || !email || !password) {
        return res.status(400).json({ error: "Заполните все поля" });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) return res.status(500).json({ error: "Ошибка БД" });
        if (row) return res.status(400).json({ error: "Email уже занят" });

        const sql = 'INSERT INTO users (login, email, phone, password) VALUES (?, ?, ?, ?)';
        db.run(sql, [login, email, phone, password], function (err) {
            if (err) return res.status(500).json({ error: "Ошибка сохранения" });
            res.status(201).json({ message: "Успешно", id: this.lastID });
        });
    });
};

const loginUser = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Введите email и пароль" });
    }

    db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
        if (err) return res.status(500).json({ error: "Ошибка БД" });

        if (!row) {
            return res.status(401).json({ error: "Неверный email или пароль" });
        }

        res.json({
            message: "Успешный вход",
            user: { id: row.id, login: row.login, email: row.email }
        });
    });
};

module.exports = { getUsers, registerUser, loginUser };