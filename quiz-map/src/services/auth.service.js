import axios from 'axios';

// URL de base de l'API mise à jour avec le bon port
const API_URL = 'http://localhost:5055/api';

// Configuration d'un intercepteur pour le débogage
axios.interceptors.request.use(request => {
  console.log('🚀 Request:', request.method.toUpperCase(), request.url);
  console.log('📡 Headers:', request.headers);
  console.log('📦 Data:', request.data);
  return request;
});

axios.interceptors.response.use(
  response => {
    console.log('✅ Response:', response.status, response.statusText);
    console.log('📦 Data:', response.data);
    return response;
  },
  error => {
    console.error('❌ Response Error:', error);
    if (error.response) {
      console.error('📦 Error Data:', error.response.data);
      console.error('🔢 Status:', error.response.status);
      console.error('📝 Headers:', error.response.headers);
    } else if (error.request) {
      console.error('🔌 No Response Received:', error.request);
    } else {
      console.error('⚠️ Error Setting up Request:', error.message);
    }
    return Promise.reject(error);
  }
);

const AuthService = {
  /**
   * Connexion utilisateur
   * @param {Object} credentials - Les identifiants de connexion
   * @returns {Promise} - Promesse avec les données utilisateur
   */
  async login(credentials) {
    console.log('🔐 Tentative de connexion avec:', credentials);
    try {
      console.log('📤 Envoi requête login à:', `${API_URL}/auth/login`);
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      console.log('📥 Réponse login reçue:', response.data);
      
      // Vérification du format de la réponse
      if (!response.data.token) {
        console.error('❌ Format de réponse invalide: token manquant');
        throw new Error('Format de réponse invalide: token manquant');
      }
      
      const { token, user } = response.data;
      
      // Stocker le token dans localStorage
      localStorage.setItem('token', token);
      console.log('💾 Token stocké dans localStorage');
      
      // Stocker les informations utilisateur dans localStorage
      localStorage.setItem('user', JSON.stringify(user));
      console.log('💾 User stocké dans localStorage');
      
      // Configurer axios pour inclure le token dans toutes les requêtes futures
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('🔧 Headers Axios configurés avec le token');
      
      return { token, user };
    } catch (error) {
      console.error('❌ Erreur login:', error);
      if (error.response) {
        console.error('📄 Détails erreur serveur:', error.response.data);
      }
      throw error.response?.data?.message || 'Erreur de connexion';
    }
  },
  
  /**
   * Inscription utilisateur
   * @param {Object} userData - Les données d'inscription
   * @returns {Promise} - Promesse avec le résultat
   */
  async register(userData) {
    console.log('📝 Tentative d\'inscription avec:', userData);
    try {
      console.log('📤 Envoi requête register à:', `${API_URL}/auth/register`);
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      console.log('📥 Réponse register reçue:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur register:', error);
      if (error.response) {
        console.error('📄 Détails erreur serveur:', error.response.data);
      } else if (error.request) {
        console.error('🔌 Pas de réponse du serveur, vérifiez l\'URL et le serveur');
      } else {
        console.error('⚠️ Erreur de configuration:', error.message);
      }
      throw error.response?.data?.message || 'Erreur d\'inscription';
    }
  },
  
  /**
   * Déconnexion utilisateur
   */
  logout() {
    // Supprimer le token et les infos utilisateur
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Supprimer le header d'autorisation
    delete axios.defaults.headers.common['Authorization'];
  },
  
  /**
   * Récupérer le profil utilisateur
   * @returns {Promise} - Promesse avec les données du profil
   */
  async getUserProfile() {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Non authentifié');
      
      // Configurer axios avec le token
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await axios.get(`${API_URL}/users/profile`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Erreur lors du chargement du profil';
    }
  },
  
  /**
   * Réinitialiser le mot de passe
   * @param {string} email - L'email de l'utilisateur
   * @returns {Promise} - Promesse avec le résultat
   */
  async resetPassword(email) {
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, { email });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe';
    }
  },
  
  /**
   * Vérifier si l'utilisateur est authentifié
   * @returns {boolean} - True si authentifié, false sinon
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
  
  /**
   * Récupérer l'utilisateur courant
   * @returns {Object|null} - Données utilisateur ou null
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  },
  
  /**
   * Vérifier si l'utilisateur est administrateur
   * @returns {boolean} - True si admin, false sinon
   */
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  }
};

export default AuthService;