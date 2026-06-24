const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const userController = require('../controllers/userController');
const cinemaController = require('../controllers/cinemaController');
const ticketController = require('../controllers/ticketController');
const { checkAdmin } = require('../middleware/authMiddleware');

router.get('/users/details/:id', userController.getUserProfile);
router.get('/movies', movieController.getMovies);
router.get('/movies/:id', movieController.getMovieById);
router.post('/movies', checkAdmin, movieController.addMovie);

router.get('/cinemas', cinemaController.getCinemas);
router.get('/cities', cinemaController.getCities);
router.get('/cinemas/city/:cityName', cinemaController.getCinemasByCity);
router.get('/sessions/:movieId', cinemaController.getSessions);

router.post('/users/register', userController.registerUser);
router.post('/users/login', userController.loginUser);
router.put('/users/profile', userController.updateProfile);
router.get('/users', userController.getPublicUsers);

router.post('/users/invite', userController.sendInvite);
router.post('/users/invite/accept', userController.acceptInvite);
router.get('/users/:userId/friends', userController.getMyFriends);

router.post('/users/achievements', userController.unlockAchievement);
router.get('/users/:userId/achievements', userController.getUserAchievements);

router.post('/tickets/buy', ticketController.buyTickets);
router.get('/tickets/:userId', ticketController.getMyTickets);

router.get('/config/keys', (req, res) => {
    res.json({ geminiKey: process.env.GEMINI_API_KEY });
});

module.exports = router;