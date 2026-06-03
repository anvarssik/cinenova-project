const express = require('express');
const router = express.Router();

const movies = [
    { id: 1, title: "Супер Марио: Галактическое кино", genre: "Мультфильм", rating: 6.6 },
    { id: 2, title: "Холоп 3", genre: "Комедия", rating: 7.2 },
    { id: 3, title: "Шрек 5", genre: "Мультфильм", rating: 8.5 }
];

const cinemas = [
    { id: 1, name: "Новый свет", address: "ул. Казахстанской правды 71" },
    { id: 2, name: "Atlas Cinema", address: "ул. Жумабаева 91" },
    { id: 3, name: "Cinema Park", address: "ул. Шокана Уалиханова 56" }
];

const users = [
    { id: 1, name: "Александр", age: 22, match: 95 },
    { id: 2, name: "Мария", age: 20, match: 88 },
    { id: 3, name: "Максим", age: 25, match: 74 }
];

router.get('/', (req, res) => {
    res.json({ message: "API is working" });
});

router.get('/movies', (req, res) => {
    res.json(movies);
});

router.get('/cinemas', (req, res) => {
    res.json(cinemas);
});

router.get('/users', (req, res) => {
    res.json(users);
});

module.exports = router;