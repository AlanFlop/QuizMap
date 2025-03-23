// make-admin.js
const mongoose = require('mongoose');
const config = require('./quiz-map-api/config/config');
const User = require('./quiz-map-api/models/user.model');

// Connecter à la base de données
mongoose.connect(config.mongoURI)
  .then(async () => {
    console.log('Connecté à MongoDB');
    
    // Mettre à jour l'utilisateur
    try {
      const result = await User.findOneAndUpdate(
        { username: "superadmin" }, // changez ceci si votre utilisateur a un nom différent
        { $set: { role: "admin" } },
        { new: true }
      );
      
      if (result) {
        console.log('Utilisateur mis à jour avec succès:');
        console.log(`Username: ${result.username}`);
        console.log(`Email: ${result.email}`);
        console.log(`Role: ${result.role}`);
      } else {
        console.log('Utilisateur non trouvé');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
    
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('Connexion fermée');
  })
  .catch(err => {
    console.error('Erreur de connexion:', err);
  });