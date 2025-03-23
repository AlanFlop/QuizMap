const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/user.model');

exports.verifyToken = async (req, res, next) => {
  try {
    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token d\'authentification requis' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Vérifier le token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Trouver l'utilisateur
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Ajouter l'utilisateur à la requête
    req.user = {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ 
      message: 'Token non valide ou expiré',
      error: error.message
    });
  }
};

// Middleware pour vérifier le rôle administrateur
exports.verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé, rôle administrateur requis' });
  }
};