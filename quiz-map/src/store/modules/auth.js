import AuthService from '@/services/auth.service';

const state = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null
};

const getters = {
  isAuthenticated: state => !!state.token,
  user: state => state.user,
  loading: state => state.loading,
  error: state => state.error,
  isAdmin: state => state.user && state.user.role === 'admin'
};

const actions = {
  async login({ commit }, credentials) {
    commit('setLoading', true);
    commit('setError', null);
    
    try {
      console.group('🔄 Store Action: login');
      console.log('Credentials reçues:', {
        email: credentials.email,
        password: '***masqué***',
        rememberMe: credentials.rememberMe
      });
      
      const { token, user } = await AuthService.login(credentials);
      console.log('✅ Login réussi:', { token: token ? 'présent' : 'absent', user });
      
      console.log('🔄 Commit des mutations setToken et setUser');
      commit('setToken', token);
      commit('setUser', user);
      
      console.groupEnd();
      return user;
    } catch (error) {
      console.error('❌ Erreur login dans le store:', error);
      let errorMessage = 'Email ou mot de passe incorrect';
      
      if (error.response && error.response.data) {
        console.error('Détails de l\'erreur serveur:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      commit('setError', errorMessage);
      throw error;
    } finally {
      commit('setLoading', false);
    }
  },
  
  async register({ commit }, userData) {
    commit('setLoading', true);
    commit('setError', null);
    
    try {
      await AuthService.register(userData);
      return true;
    } catch (error) {
      commit('setError', error.response?.data?.message || 'Erreur d\'inscription');
      throw error;
    } finally {
      commit('setLoading', false);
    }
  },
  
  logout({ commit }) {
    // Utiliser le service d'authentification
    AuthService.logout();
    
    commit('setToken', null);
    commit('setUser', null);
  },
  
  async fetchUserProfile({ commit, state }) {
    if (!state.token) return;
    
    try {
      const userData = await AuthService.getUserProfile();
      commit('setUser', userData);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      // Si le token est invalide, déconnexion
      if (error.response && error.response.status === 401) {
        commit('logout');
      }
    }
  },
  
  // Vérifier l'état d'authentification au démarrage de l'application
  async checkAuth({ commit, dispatch }) {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (token && user) {
      // Configurer axios avec le token
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      commit('setToken', token);
      commit('setUser', user);
      
      // Optionnel: vérifier que le token est toujours valide
      dispatch('fetchUserProfile');
    } else {
      commit('setToken', null);
      commit('setUser', null);
    }
  }
};

const mutations = {
  setUser(state, user) {
    state.user = user;
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  },
  
  setToken(state, token) {
    state.token = token;
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  },
  
  setLoading(state, loading) {
    state.loading = loading;
  },
  
  setError(state, error) {
    state.error = error;
  },
  
  clearError(state) {
    state.error = null;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};