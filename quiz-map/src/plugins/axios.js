// Ce fichier aide à déboguer la configuration d'Axios
// À ajouter dans quiz-map/src/plugins/axios.js

import axios from 'axios';

// Configuration de base
axios.defaults.baseURL = 'http://localhost:5050/api';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Intercepteurs pour le débogage
axios.interceptors.request.use(request => {
  console.group(`📤 Requête ${request.method.toUpperCase()} - ${request.url}`);
  console.log('Headers:', request.headers);
  
  // Afficher les données sans les mots de passe
  const safeData = { ...request.data };
  if (safeData.password) safeData.password = '***masqué***';
  console.log('Données:', safeData);
  
  console.groupEnd();
  return request;
}, error => {
  console.error('❌ Erreur de requête:', error);
  return Promise.reject(error);
});

axios.interceptors.response.use(response => {
  console.group(`📥 Réponse de ${response.config.url}`);
  console.log('Status:', response.status);
  console.log('Données:', response.data);
  console.groupEnd();
  return response;
}, error => {
  console.group('❌ Erreur de réponse');
  if (error.response) {
    // La requête a été faite et le serveur a répondu avec un code d'erreur
    console.error('Status:', error.response.status);
    console.error('Données:', error.response.data);
    console.error('Headers:', error.response.headers);
  } else if (error.request) {
    // La requête a été faite mais aucune réponse n'a été reçue
    console.error('Pas de réponse reçue du serveur:', error.request);
  } else {
    // Erreur lors de la configuration de la requête
    console.error('Erreur de configuration:', error.message);
  }
  console.error('Configuration de la requête:', error.config);
  console.groupEnd();
  return Promise.reject(error);
});

// Fonction de test pour vérifier la configuration
const testAxiosConfig = () => {
  console.group('🔍 Test de la configuration Axios');
  console.log('URL de base:', axios.defaults.baseURL);
  console.log('Headers par défaut:', axios.defaults.headers.common);
  
  // Vérifier si le token est présent
  const token = localStorage.getItem('token');
  console.log('Token en localStorage:', token ? 'Présent' : 'Absent');
  
  if (token) {
    console.log('Authorization header:', axios.defaults.headers.common['Authorization']);
  }
  
  console.log('Intercepteurs configurés:', {
    request: axios.interceptors.request.handlers.length > 0,
    response: axios.interceptors.response.handlers.length > 0
  });
  
  console.groupEnd();
};

export default axios;
export { testAxiosConfig };