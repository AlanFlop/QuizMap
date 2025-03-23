const mongoose = require('mongoose');
const config = require('./config');

// Supprimer l'avertissement strictQuery
mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    // Suppression des options obsolètes
    const conn = await mongoose.connect(config.mongoURI);
    
    console.log(`MongoDB connecté: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Erreur de connexion à MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;