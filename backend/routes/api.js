const express = require('express');
const router = express.Router();

const { getMovies, getMovieById } = require('../controllers/movieController');
const { getUsers } = require('../controllers/userController');
const { getCinemas } = require('../controllers/cinemaController');

router.get('/movies', getMovies);
router.get('/movies/:id', getMovieById);
router.get('/users', getUsers);
router.get('/cinemas', getCinemas);

module.exports = router;