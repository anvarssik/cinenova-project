const db = require('../database/db');

const getMovies = (req, res) => {
    let query = 'SELECT * FROM movies';
    let params = [];

    if (req.query.genre && req.query.genre !== 'All') {
        query += ' WHERE LOWER(genre) = LOWER(?)';
        params.push(req.query.genre);
    }

    if (req.query.sort === 'desc' || req.query.sort === 'ratingDesc') {
        query += ' ORDER BY rating DESC';
    } else if (req.query.sort === 'asc' || req.query.sort === 'ratingAsc') {
        query += ' ORDER BY rating ASC';
    } else if (req.query.sort === 'yearDesc') {
        query += ' ORDER BY release_year DESC';
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const mappedRows = rows.map(m => ({
            id: m.id,
            nameRu: m.title,
            genres: [{ genre: m.genre }],
            ratingKinopoisk: m.rating,
            year: m.release_year,
            posterUrlPreview: m.poster_url || 'img/mario-poster-small.png'
        }));
        res.json(mappedRows);
    });
};

const getMovieById = (req, res) => {
    const movieId = parseInt(req.params.id);
    db.get('SELECT * FROM movies WHERE id = ?', [movieId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ message: "Not found" });
        res.json(row);
    });
};

const addMovie = (req, res) => {
    const { title, genre, release_year, rating } = req.body;

    if (!title || !genre) {
        return res.status(400).json({ error: 'Bad request' });
    }

    const sql = 'INSERT INTO movies (title, genre, release_year, rating) VALUES (?, ?, ?, ?)';
    db.run(sql, [title, genre, release_year, rating], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Фильм успешно добавлен', id: this.lastID });
    });
};

module.exports = { getMovies, getMovieById, addMovie };