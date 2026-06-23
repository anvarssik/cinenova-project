const db = require('./database/db');
const times = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];

db.serialize(() => {
    db.all('SELECT id FROM movies', [], (err, movies) => {
        db.all('SELECT id FROM halls', [], (err, halls) => {
            if (movies.length === 0 || halls.length === 0) return;
            movies.forEach(movie => {
                const hallId = halls[movie.id % halls.length].id;
                times.forEach(time => {
                    db.run(
                        'INSERT INTO sessions (movie_id, hall_id, show_time, price) VALUES (?, ?, ?, ?)',
                        [movie.id, hallId, time, 1900 + (movie.id * 100)]
                    );
                });
            });
            console.log("Sessions generated.");
        });
    });
});