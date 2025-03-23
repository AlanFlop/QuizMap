const Quiz = require('../models/quiz.model');

// Obtenir tous les quiz actifs (pour les utilisateurs)
exports.getActiveQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ active: true })
      .select('name description difficulty createdAt countries');
    
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des quiz',
      error: error.message 
    });
  }
};

// Obtenir un quiz spécifique par ID
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ 
      _id: req.params.id,
      active: true 
    }).select('name description difficulty createdAt countries');
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz non trouvé ou inactif' });
    }
    
    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la récupération du quiz',
      error: error.message 
    });
  }
};