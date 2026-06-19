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

module.exports = { getCinemas };