// store/modules/quiz.js

const state = {
    quizzes: [],
    activeQuizId: null,
    loading: false,
    error: null
  };
  
  const getters = {
    allQuizzes: state => state.quizzes,
    
    // Quiz actifs (filtrer les quiz inactifs)
    activeQuizzes: state => state.quizzes.filter(quiz => quiz.active),
    
    // Quiz actif sélectionné
    activeQuiz: state => {
      if (!state.activeQuizId) return null;
      return state.quizzes.find(quiz => quiz.id === state.activeQuizId);
    },
    
    // Obtenir un quiz par son ID
    getQuizById: state => id => {
      return state.quizzes.find(quiz => quiz.id === id);
    },
    
    isLoading: state => state.loading,
    
    error: state => state.error
  };
  
  const actions = {
    // Charger les quiz (depuis l'API ou le localStorage)
    async fetchQuizzes({ commit }) {
      commit('SET_LOADING', true);
      try {
        // En mode démo, charger depuis le localStorage
        const storedQuizzes = localStorage.getItem('quizzes');
        
        if (storedQuizzes) {
          const quizzes = JSON.parse(storedQuizzes);
          commit('SET_QUIZZES', quizzes);
          console.log(`${quizzes.length} quiz chargés depuis le localStorage`);
        } else {
          // S'il n'y a pas de quiz en localStorage, ajouter des quiz par défaut
          const defaultQuizzes = [
            {
              id: '1',
              name: 'Pays de l\'Union Européenne',
              description: 'Testez vos connaissances sur les pays membres de l\'UE',
              difficulty: 2,
              active: true,
              countries: {
                'FR': true, 'DE': true, 'IT': true, 'ES': true, 'PT': true,
                'BE': true, 'NL': true, 'LU': true, 'DK': true, 'SE': true,
                'FI': true, 'IE': true, 'AT': true, 'EE': true, 'LV': true,
                'LT': true, 'PL': true, 'CZ': true, 'SK': true, 'HU': true,
                'SI': true, 'HR': true, 'RO': true, 'BG': true, 'CY': true,
                'GR': true, 'MT': true
              }
            },
            {
              id: '2',
              name: 'Pays d\'Afrique',
              description: 'Découvrez les nations du continent africain',
              difficulty: 3,
              active: true,
              countries: {
                'MA': true, 'DZ': true, 'TN': true, 'LY': true, 'EG': true,
                'SD': true, 'SS': true, 'ET': true, 'ER': true, 'DJ': true,
                'SO': true, 'KE': true, 'UG': true, 'TZ': true, 'RW': true,
                'BI': true, 'CD': true, 'CG': true, 'GA': true, 'GQ': true,
                'CM': true, 'CF': true, 'TD': true, 'NE': true, 'ML': true,
                'BF': true, 'SN': true, 'GM': true, 'GW': true, 'GN': true,
                'SL': true, 'LR': true, 'CI': true, 'GH': true, 'TG': true
              }
            },
            {
              id: '3',
              name: 'Capitales mondiales',
              description: 'Connaissez-vous les capitales des pays du monde ?',
              difficulty: 2,
              active: true,
              countries: {
                'FR': true, 'DE': true, 'IT': true, 'ES': true, 'GB': true,
                'US': true, 'CA': true, 'MX': true, 'BR': true, 'AR': true,
                'RU': true, 'CN': true, 'JP': true, 'IN': true, 'AU': true,
                'ZA': true, 'EG': true, 'MA': true, 'NG': true, 'KE': true
              }
            }
          ];
          
          commit('SET_QUIZZES', defaultQuizzes);
          localStorage.setItem('quizzes', JSON.stringify(defaultQuizzes));
          console.log('Quiz par défaut créés et sauvegardés');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des quiz:', error);
        commit('SET_ERROR', 'Erreur lors du chargement des quiz');
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Sélectionner un quiz actif
    setActiveQuiz({ commit }, quizId) {
      commit('SET_ACTIVE_QUIZ', quizId);
    },
    
    // Sauvegarder un quiz
    async saveQuiz({ commit, state }, quizData) {
      commit('SET_LOADING', true);
      try {
        const currentQuizzes = [...state.quizzes];
        
        // Si le quiz a un ID, c'est une mise à jour
        if (quizData.id) {
          const index = currentQuizzes.findIndex(q => q.id === quizData.id);
          if (index !== -1) {
            currentQuizzes[index] = { ...quizData };
          }
        } else {
          // Sinon, c'est un nouveau quiz
          const newId = Date.now().toString();
          const newQuiz = {
            ...quizData,
            id: newId
          };
          currentQuizzes.push(newQuiz);
        }
        
        // Mise à jour du state et du localStorage
        commit('SET_QUIZZES', currentQuizzes);
        localStorage.setItem('quizzes', JSON.stringify(currentQuizzes));
        
        return quizData.id || newId;
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du quiz:', error);
        commit('SET_ERROR', 'Erreur lors de la sauvegarde du quiz');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // Supprimer un quiz
    async deleteQuiz({ commit, state }, quizId) {
      commit('SET_LOADING', true);
      try {
        const updatedQuizzes = state.quizzes.filter(quiz => quiz.id !== quizId);
        
        // Mise à jour du state et du localStorage
        commit('SET_QUIZZES', updatedQuizzes);
        localStorage.setItem('quizzes', JSON.stringify(updatedQuizzes));
        
        // Si le quiz supprimé était actif, désactiver la sélection
        if (state.activeQuizId === quizId) {
          commit('SET_ACTIVE_QUIZ', null);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du quiz:', error);
        commit('SET_ERROR', 'Erreur lors de la suppression du quiz');
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    }
  };
  
  const mutations = {
    SET_QUIZZES(state, quizzes) {
      state.quizzes = quizzes;
    },
    
    SET_ACTIVE_QUIZ(state, quizId) {
      state.activeQuizId = quizId;
    },
    
    SET_LOADING(state, status) {
      state.loading = status;
    },
    
    SET_ERROR(state, error) {
      state.error = error;
    }
  };
  
  export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
  };