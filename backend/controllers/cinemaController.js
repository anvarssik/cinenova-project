const db = require('../database/db');

const getCinemas = (req, res) => {
    const query = `
        SELECT cinemas.id, cinemas.name, cinemas.address, cities.name AS city 
        FROM cinemas 
        JOIN cities ON cinemas.city_id = cities.id
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const mappedCinemas = rows.map(c => ({
            id: c.id,
            name: c.name,
            address: c.address,
            city: c.city,
            tags: c.id % 2 === 0 ? ["4DX", "Comfort"] : ["2D", "16+"],
            icon: c.id % 2 === 0 ? "fa-video-camera" : "fa-film"
        }));

        res.json(mappedCinemas);
    });
};

const getCities = (req, res) => {
    db.all('SELECT * FROM cities', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

const getCinemasByCity = (req, res) => {
    const cityName = req.params.cityName;
    const query = `
        SELECT cinemas.id, cinemas.name, cinemas.address, cities.name AS city 
        FROM cinemas 
        JOIN cities ON cinemas.city_id = cities.id
        WHERE cities.name = ?
    `;
    db.all(query, [cityName], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const mappedCinemas = rows.map(c => ({
            id: c.id,
            name: c.name,
            address: c.address,
            city: c.city,
            tags: c.id % 2 === 0 ? ["4DX", "Comfort"] : ["2D", "16+"],
            icon: c.id % 2 === 0 ? "fa-video-camera" : "fa-film"
        }));

        res.json(mappedCinemas);
    });
};

const getSessions = (req, res) => {
    const movieId = req.params.movieId;
    db.all('SELECT * FROM sessions WHERE movie_id = ? ORDER BY show_time ASC', [movieId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

module.exports = { getCinemas, getCities, getCinemasByCity, getSessions };