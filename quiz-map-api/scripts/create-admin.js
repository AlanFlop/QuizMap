const mongoose = require('mongoose');
const User = require('../models/user.model');
const config = require('../config/config');

// Informations de l'administrateur initial
const adminData = {
  username: 'admin',
  email: 'admin@exemple.com',
  password: 'Admin@123',
  role: 'admin'
};

// Supprimer l'avertissement strictQuery
mongoose.set('strictQuery', false);

// Connexion à MongoDB - Suppression des options obsolètes
mongoose.connect(config.mongoURI)
  .then(() => console.log('Connexion à MongoDB établie'))
  .catch(err => {
    console.error('Erreur de connexion à MongoDB', err);
    process.exit(1);
  });

// Créer l'administrateur
const createAdmin = async () => {
  try {
    // Vérifier si un administrateur existe déjà
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('Un administrateur existe déjà:');
      console.log(`- Nom d'utilisateur: ${existingAdmin.username}`);
      console.log(`- Email: ${existingAdmin.email}`);
      process.exit(0);
    }
    
    // Créer un nouvel administrateur
    const admin = new User(adminData);
    await admin.save();
    
    console.log('Administrateur créé avec succès:');
    console.log(`- Nom d'utilisateur: ${adminData.username}`);
    console.log(`- Email: ${adminData.email}`);
    console.log(`- Mot de passe: ${adminData.password}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la création de l\'administrateur:', error);
    process.exit(1);
  }
};

// Exécuter la fonction
createAdmin();