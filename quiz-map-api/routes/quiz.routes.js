const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');

// Routes publiques pour accéder aux quiz actifs
router.get('/', quizController.getActiveQuizzes);
router.get('/:id', quizController.getQuizById);

module.exports = router;