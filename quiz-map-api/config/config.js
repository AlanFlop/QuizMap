module.exports = {
    mongoURI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/monde-quiz',
    jwtSecret: process.env.JWT_SECRET || 'votre_secret_jwt_securise',
    port: process.env.PORT || 4269
  };