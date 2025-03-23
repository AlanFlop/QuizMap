const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validators = require('../middleware/validators.middleware');

// Routes publiques
router.post('/register', validators.validateRegistration, authController.register);
router.post('/login', validators.validateLogin, authController.login);

// Routes protégées (admin)
router.post('/admin/create', authMiddleware.verifyToken, authMiddleware.verifyAdmin, validators.validateRegistration, authController.createAdmin);
router.put('/admin/promote/:userId', authMiddleware.verifyToken, authMiddleware.verifyAdmin, authController.promoteToAdmin);
router.put('/admin/demote/:userId', authMiddleware.verifyToken, authMiddleware.verifyAdmin, authController.demoteToUser);

// Route temporaire pour promouvoir un utilisateur en admin
// À SUPPRIMER AVANT LA MISE EN PRODUCTION
router.get('/make-admin/:username', async (req, res) => {
  try {
    const User = require('../models/user.model');
    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      { $set: { role: 'admin' } },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.json({ 
      success: true, 
      message: `Utilisateur ${user.username} promu administrateur`,
      user: {
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;