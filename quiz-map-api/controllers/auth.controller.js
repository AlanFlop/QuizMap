const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Gestion de l'inscription
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: "Un utilisateur avec cet email ou ce nom d'utilisateur existe déjà"
      });
    }
    
    // Créer un nouvel utilisateur
    const user = new User({
      username,
      email,
      password,
      role: 'user' // Par défaut, tous les nouveaux utilisateurs sont de rôle "user"
    });
    
    await user.save();
    
    res.status(201).json({ 
      message: 'Utilisateur créé avec succès',
      userId: user._id
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de l\'inscription',
      error: error.message 
    });
  }
};

// Gestion de la connexion
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Trouver l'utilisateur par email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    // Mettre à jour la date de dernière connexion
    user.lastLoginAt = Date.now();
    await user.save();
    
    // Générer un JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: '1d' }
    );
    
    // Renvoyer les informations utilisateur et le token
    res.status(200).json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        score: user.score
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la connexion',
      error: error.message 
    });
  }
};

// Créer un administrateur (accessible uniquement aux administrateurs)
exports.createAdmin = async (req, res) => {
  try {
    // Vérifier si l'utilisateur actuel est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    
    const { username, email, password } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: "Un utilisateur avec cet email ou ce nom d'utilisateur existe déjà"
      });
    }
    
    // Créer un nouvel administrateur
    const admin = new User({
      username,
      email,
      password,
      role: 'admin'
    });
    
    await admin.save();
    
    res.status(201).json({ 
      message: 'Administrateur créé avec succès',
      userId: admin._id
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la création de l\'administrateur',
      error: error.message 
    });
  }
};

// Promouvoir un utilisateur en administrateur
exports.promoteToAdmin = async (req, res) => {
  try {
    // Vérifier si l'utilisateur actuel est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Mettre à jour le rôle
    user.role = 'admin';
    await user.save();
    
    res.status(200).json({ 
      message: 'Utilisateur promu administrateur avec succès' 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la promotion de l\'utilisateur',
      error: error.message 
    });
  }
};

// Rétrograder un administrateur en utilisateur
exports.demoteToUser = async (req, res) => {
  try {
    // Vérifier si l'utilisateur actuel est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Mettre à jour le rôle
    user.role = 'user';
    await user.save();
    
    res.status(200).json({ 
      message: 'Administrateur rétrogradé en utilisateur avec succès' 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la rétrogradation de l\'administrateur',
      error: error.message 
    });
  }
};