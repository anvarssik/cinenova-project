const express = require('express');
const router = express.Router();

const { getMovies, getMovieById } = require('../controllers/movieController');
const { getUsers, registerUser, loginUser } = require('../controllers/userController');
const { getCinemas } = require('../controllers/cinemaController');

router.get('/movies', getMovies);
router.get('/movies/:id', getMovieById);
router.get('/cinemas', getCinemas);
router.get('/users', getUsers);
router.post('/users/register', registerUser);
router.post('/users/login', loginUser);

module.exports = router;