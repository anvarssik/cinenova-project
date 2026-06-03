const movies = [
    { id: 1, nameRu: "Супер Марио: Галактическое кино", genres: [{genre: "Мультфильм"}], ratingKinopoisk: 6.6, year: 2023, posterUrlPreview: "img/mario-poster-small.png" },
    { id: 2, nameRu: "Холоп 3", genres: [{genre: "Комедия"}], ratingKinopoisk: 7.2, year: 2024, posterUrlPreview: "img/movie-holop.png" },
    { id: 3, nameRu: "Шрек 5", genres: [{genre: "Мультфильм"}], ratingKinopoisk: 8.5, year: 2025, posterUrlPreview: "img/movie-shreak5.png" }
];

const getMovies = (req, res) => {
    res.json(movies);
};

module.exports = { getMovies };