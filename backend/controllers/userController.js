const db = require('../database/db');

const registerUser = (req, res) => {
    const { login, email, password, phone } = req.body;
    db.run('INSERT INTO users (login, email, phone, password, role, avatar_url, is_private) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [login, email, phone || '', password, 'user', 'img/avatar1.png', 0],
        function (err) {
            if (err) return res.status(400).json({ error: 'Email или логин уже заняты' });
            res.status(201).json({ id: this.lastID, login, email, role: 'user', avatar_url: 'img/avatar1.png' });
        });
};

const loginUser = (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT id, login, email, role, avatar_url, is_private FROM users WHERE email = ? AND password = ?',
        [email, password],
        (err, user) => {
            if (err) return res.status(500).json({ error: 'Ошибка БД' });
            if (!user) return res.status(401).json({ error: 'Неверный email или пароль' });

            user.avatar_url = user.avatar_url || 'img/avatar1.png';
            res.json({ message: "Успешный вход", user });
        });
};

const getPublicUsers = (req, res) => {
    db.all('SELECT id, login, avatar_url FROM users WHERE is_private = 0', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

const sendInvite = (req, res) => {
    const { from_user, to_user } = req.body;
    db.get('SELECT * FROM friends WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?)',
        [from_user, to_user, to_user, from_user], (err, row) => {
            if (row) return res.status(400).json({ error: 'Инвайт уже существует' });

            db.run('INSERT INTO friends (user_id1, user_id2, status) VALUES (?, ?, ?)', [from_user, to_user, 'pending'], (err) => {
                if (err) return res.status(500).json({ error: 'Ошибка БД' });
                res.json({ success: true });
            });
        });
};

const getMyFriends = (req, res) => {
    const userId = req.params.userId;
    const query = `
        SELECT u.id, u.login, u.avatar_url, f.status, f.user_id1, f.user_id2 
        FROM users u 
        JOIN friends f ON (u.id = f.user_id2 AND f.user_id1 = ?) OR (u.id = f.user_id1 AND f.user_id2 = ?)
        WHERE u.id != ?
    `;
    db.all(query, [userId, userId, userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

const acceptInvite = (req, res) => {
    const { user_id1, user_id2 } = req.body;
    db.run('UPDATE friends SET status = ? WHERE user_id1 = ? AND user_id2 = ?', ['accepted', user_id1, user_id2], (err) => {
        if (err) return res.status(500).json({ error: 'Failed' });
        res.json({ success: true });
    });
};

const updateProfile = (req, res) => {
    const { email, avatar_url, is_private } = req.body;
    db.run('UPDATE users SET avatar_url = ?, is_private = ? WHERE email = ?', [avatar_url, is_private, email], (err) => {
        if (err) return res.status(500).json({ error: 'Update failed' });
        res.json({ success: true });
    });
};

const unlockAchievement = (req, res) => {
    const { user_id, achievement_id } = req.body;
    db.run('INSERT OR IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)', [user_id, achievement_id], (err) => {
        res.json({ success: true });
    });
};

const getUserAchievements = (req, res) => {
    db.all(`SELECT a.id, a.name, a.icon, ua.date_earned FROM user_achievements ua JOIN achievements a ON ua.achievement_id = a.id WHERE ua.user_id = ?`,
        [req.params.userId], (err, rows) => {
            res.json(rows || []);
        });
};

const getUserProfile = (req, res) => {
    const targetId = req.params.id;
    db.get('SELECT id, login, avatar_url, is_private FROM users WHERE id = ?', [targetId], (err, user) => {
        if (err || !user) return res.status(404).json({ error: 'Пользователь не найден' });

        if (user.is_private === 1) {
            return res.json({ id: user.id, login: 'Анонимный киноман', avatar_url: 'img/avatar1.png', is_private: 1, message: 'Профиль скрыт настройками приватности' });
        }

        db.all('SELECT movie_title FROM tickets WHERE user_id = ?', [targetId], (err, tickets) => {
            db.all('SELECT a.name, a.icon FROM user_achievements ua JOIN achievements a ON ua.achievement_id = a.id WHERE ua.user_id = ?', [targetId], (err, achs) => {
                res.json({ ...user, tickets: tickets || [], achievements: achs || [] });
            });
        });
    });
};

module.exports = { registerUser, loginUser, getPublicUsers, sendInvite, getMyFriends, acceptInvite, updateProfile, unlockAchievement, getUserAchievements, getUserProfile };