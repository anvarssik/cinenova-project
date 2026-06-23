const db = require('../database/db');

const buyTickets = (req, res) => {
    const { user_id, session_id, tickets } = req.body;

    tickets.forEach(ticket => {
        db.run('INSERT INTO tickets (session_id, user_id, seat_number, status, movie_title) VALUES (?, ?, ?, ?, ?)',
            [session_id || 1, user_id, ticket.seat, 'paid', ticket.movie], (err) => {
                if (err) console.error(err);
            });
    });

    res.json({ success: true, message: 'Билеты успешно сохранены в базу' });
};

const getMyTickets = (req, res) => {
    const userId = req.params.userId;
    db.all('SELECT * FROM tickets WHERE user_id = ? ORDER BY id DESC', [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

module.exports = { buyTickets, getMyTickets };