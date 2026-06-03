const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const movieController = require('../controllers/movieController');
const cinemaController = require('../controllers/cinemaController');

router.get('/', (req, res) => {
    res.json({ message: "API is working" });
});

router.get('/users', userController.getUsers);
router.get('/movies', movieController.getMovies);
router.get('/cinemas', cinemaController.getCinemas);

module.exports = router;