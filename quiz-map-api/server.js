const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const config = require('./config/config');

// Routes
const authRoutes = require('./routes/auth.routes');
const quizRoutes = require('./routes/quiz.routes');
const adminQuizRoutes = require('./routes/admin/quiz.routes');

// Initialiser Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connecter à la base de données
connectDB();

// Route de base pour l'API
app.get('/api', (req, res) => {
  res.json({ message: 'API du Quiz Monde' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/admin/quizzes', adminQuizRoutes);

// Route de base
app.get('/', (req, res) => {
  res.json({ message: 'API du Quiz Monde' });
});

// Ajouter une journalisation pour les requêtes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Gestion des routes non trouvées
app.use((req, res) => {
  console.log(`Route non trouvée: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Route non trouvée' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err.stack);
  res.status(500).json({ 
    message: 'Erreur serveur',
    error: process.env.NODE_ENV === 'production' ? {} : err.message 
  });
});

// Exemple de configuration correcte dans server.js
const PORT = process.env.PORT || 5055;

// À la fin de votre fichier
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log('Routes disponibles:');
  console.log('- GET /api - Route API principale');
  console.log('- POST /api/auth/login - Connexion');
  console.log('- POST /api/auth/register - Inscription');
  console.log('- ... autres routes');
});