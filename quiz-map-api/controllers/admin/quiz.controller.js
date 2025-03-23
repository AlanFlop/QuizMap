const Quiz = require('../../models/quiz.model');

// Obtenir tous les quiz
exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des quiz',
      error: error.message 
    });
  }
};

// Créer un nouveau quiz
exports.createQuiz = async (req, res) => {
  try {
    const { name, description, difficulty, active, countries } = req.body;
    
    const quiz = new Quiz({
      name,
      description,
      difficulty,
      active,
      countries,
      createdBy: req.user.id
    });
    
    await quiz.save();
    
    res.status(201).json({
      message: 'Quiz créé avec succès',
      quiz
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la création du quiz',
      error: error.message 
    });
  }
};

// Obtenir un quiz par ID
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz non trouvé' });
    }
    
    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la récupération du quiz',
      error: error.message 
    });
  }
};

// Mettre à jour un quiz
exports.updateQuiz = async (req, res) => {
  try {
    const { name, description, difficulty, active, countries } = req.body;
    
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz non trouvé' });
    }
    
    quiz.name = name;
    quiz.description = description;
    quiz.difficulty = difficulty;
    quiz.active = active;
    quiz.countries = countries;
    quiz.updatedAt = Date.now();
    
    await quiz.save();
    
    res.status(200).json({
      message: 'Quiz mis à jour avec succès',
      quiz
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour du quiz',
      error: error.message 
    });
  }
};

// Supprimer un quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz non trouvé' });
    }
    
    await Quiz.deleteOne({ _id: quiz._id });
    
    res.status(200).json({ message: 'Quiz supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la suppression du quiz',
      error: error.message 
    });
  }
};