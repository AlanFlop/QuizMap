const express = require('express');
const router = express.Router();
const quizController = require('../../controllers/admin/quiz.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const validators = require('../../middleware/validators.middleware');

// Toutes les routes nécessitent l'authentification et le rôle admin
router.use(authMiddleware.verifyToken, authMiddleware.verifyAdmin);

// Routes CRUD des quiz
router.get('/', quizController.getAllQuizzes);
router.post('/', validators.validateQuiz, quizController.createQuiz);
router.get('/:id', quizController.getQuizById);
router.put('/:id', validators.validateQuiz, quizController.updateQuiz);
router.delete('/:id', quizController.deleteQuiz);

module.exports = router;