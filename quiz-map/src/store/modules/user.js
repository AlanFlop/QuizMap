import axios from 'axios'

const state = {
  stats: null,
  leaderboard: [],
  userRank: null,
  loading: false,
  error: null
}

const getters = {
    userStats: state => state.stats,
    leaderboard: state => state.leaderboard,
    userRank: state => state.userRank,
    statsLoading: state => state.loading,
    statsError: state => state.error
  }
  
  const actions = {
    async fetchUserStats({ commit }) {
      commit('setStatsLoading', true);
      
      try {
        const response = await axios.get('/api/user/stats');
        commit('setUserStats', response.data);
      } catch (error) {
        commit('setStatsError', 'Erreur lors du chargement des statistiques');
        console.error('Error fetching user stats:', error);
      } finally {
        commit('setStatsLoading', false);
      }
    },
    
    async fetchLeaderboard({ commit }) {
      commit('setStatsLoading', true);
      
      try {
        const response = await axios.get('/api/leaderboard');
        commit('setLeaderboard', response.data);
      } catch (error) {
        commit('setStatsError', 'Erreur lors du chargement du classement');
        console.error('Error fetching leaderboard:', error);
      } finally {
        commit('setStatsLoading', false);
      }
    },
    
    async fetchUserRank({ commit }) {
      commit('setStatsLoading', true);
      
      try {
        const response = await axios.get('/api/user/rank');
        commit('setUserRank', response.data.rank);
      } catch (error) {
        console.error('Error fetching user rank:', error);
      } finally {
        commit('setStatsLoading', false);
      }
    }
  }
  
  const mutations = {
    setUserStats(state, stats) {
      state.stats = stats;
    },
    setLeaderboard(state, leaderboard) {
      state.leaderboard = leaderboard;
    },
    setUserRank(state, rank) {
      state.userRank = rank;
    },
    setStatsLoading(state, loading) {
      state.loading = loading;
    },
    setStatsError(state, error) {
      state.error = error;
    }
  }
  
  export default {
    state,
    getters,
    actions,
    mutations
  }