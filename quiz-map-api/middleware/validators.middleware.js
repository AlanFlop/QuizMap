const { body, validationResult } = require('express-validator');

// Validation des champs pour l'inscription
exports.validateRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Le nom d\'utilisateur doit contenir entre 3 et 30 caractères')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores'),
    
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
    
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validation des champs pour la connexion
exports.validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
    
  body('password')
    .not()
    .isEmpty()
    .withMessage('Le mot de passe est requis'),
    
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validation des champs pour la création/mise à jour d'un quiz
exports.validateQuiz = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Le nom du quiz doit contenir entre 3 et 100 caractères'),
    
  body('description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('La description doit contenir au moins 10 caractères'),
    
  body('difficulty')
    .isInt({ min: 1, max: 4 })
    .withMessage('La difficulté doit être entre 1 et 4'),
    
  body('active')
    .isBoolean()
    .withMessage('Le statut actif doit être un booléen'),
    
  body('countries')
    .custom(value => {
      if (typeof value !== 'object' || value === null) {
        throw new Error('La liste des pays doit être un objet');
      }
      return true;
    }),
    
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];