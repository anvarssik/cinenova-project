const movies = [
    { id: 1, nameRu: "Супер Марио: Галактическое кино", genres: [{ genre: "Мультфильм" }], ratingKinopoisk: 6.6, year: 2023, posterUrlPreview: "img/mario-poster-small.png" },
    { id: 2, nameRu: "Холоп 3", genres: [{ genre: "Комедия" }], ratingKinopoisk: 7.2, year: 2024, posterUrlPreview: "img/movie-holop.png" },
    { id: 3, nameRu: "Шрек 5", genres: [{ genre: "Мультфильм" }], ratingKinopoisk: 8.5, year: 2025, posterUrlPreview: "img/movie-shreak5.png" }
];

const getMovies = (req, res) => {
    let result = [...movies];

    if (req.query.genre) {
        result = result.filter(m => m.genres[0].genre.toLowerCase() === req.query.genre.toLowerCase());
    }
    if (req.query.sort === 'desc') {
        result.sort((a, b) => b.ratingKinopoisk - a.ratingKinopoisk);
    } else if (req.query.sort === 'asc') {
        result.sort((a, b) => a.ratingKinopoisk - b.ratingKinopoisk);
    }
    if (req.query.limit) {
        result = result.slice(0, parseInt(req.query.limit));
    }

    res.json(result);
};

const getMovieById = (req, res) => {
    const movieId = parseInt(req.params.id);
    const movie = movies.find(m => m.id === movieId);

    if (!movie) {
        return res.status(404).json({ message: "Фильм с таким ID не найден" });
    }

    res.json(movie);
};
module.exports = {
    getMovies,
    getMovieById
};