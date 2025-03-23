import axios from 'axios'

const state = {
  countries: [],
  discoveries: [],
  loading: false,
  error: null
}

const getters = {
  allCountries: state => state.countries,
  discoveries: state => state.discoveries,
  discoveredCount: state => state.discoveries.length,
  totalCountries: state => state.countries.length,
  gameLoading: state => state.loading,
  gameError: state => state.error
}

const actions = {
  async fetchCountries({ commit }) {
    commit('setGameLoading', true);
    
    try {
      const response = await axios.get('/api/countries');
      commit('setCountries', response.data);
    } catch (error) {
      commit('setGameError', 'Erreur lors du chargement des pays');
      console.error('Error fetching countries:', error);
    } finally {
      commit('setGameLoading', false);
    }
  },
  
  async fetchUserProgress({ commit }) {
    commit('setGameLoading', true);
    
    try {
      const response = await axios.get('/api/user/progress');
      commit('setDiscoveries', response.data);
    } catch (error) {
      commit('setGameError', 'Erreur lors du chargement de la progression');
      console.error('Error fetching user progress:', error);
    } finally {
      commit('setGameLoading', false);
    }
  },
  
  async saveProgress({ commit }, countryCode) {
    try {
      await axios.post('/api/user/progress', { countryCode });
      commit('addDiscovery', countryCode);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  },
  
  checkCountry({ state, commit }, countryName) {
    const normalizedGuess = normalizeText(countryName);
    
    // Vérifier si le pays existe et n'a pas encore été découvert
    const foundCountry = state.countries.find(country => {
      const matchesName = normalizeText(country.name) === normalizedGuess ||
                          normalizeText(country.name_fr) === normalizedGuess;
      
      return matchesName && !state.discoveries.includes(country.code);
    });
    
    if (foundCountry) {
      commit('addDiscovery', foundCountry.code);
      return { success: true, country: foundCountry };
    }
    
    // Vérifier si le pays a déjà été découvert
    const alreadyDiscovered = state.countries.find(country => {
      const matchesName = normalizeText(country.name) === normalizedGuess ||
                          normalizeText(country.name_fr) === normalizedGuess;
      return matchesName && state.discoveries.includes(country.code);
    });
    
    if (alreadyDiscovered) {
      return { success: false, already: true, country: alreadyDiscovered };
    }
    
    return { success: false, already: false };
  }
}

const mutations = {
  setCountries(state, countries) {
    state.countries = countries;
  },
  setDiscoveries(state, discoveries) {
    state.discoveries = discoveries;
  },
  addDiscovery(state, countryCode) {
    if (!state.discoveries.includes(countryCode)) {
      state.discoveries.push(countryCode);
    }
  },
  setGameLoading(state, loading) {
    state.loading = loading;
  },
  setGameError(state, error) {
    state.error = error;
  }
}

// Fonction utilitaire pour normaliser le texte
function normalizeText(text) {
  if (!text) return '';
  return text.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
}

export default {
  state,
  getters,
  actions,
  mutations
}