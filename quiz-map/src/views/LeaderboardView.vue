<template>
    <div class="leaderboard-view">
      <div class="leaderboard-container">
        <h1>Classement mondial</h1>
        <p class="leaderboard-description">
          Découvrez les meilleurs explorateurs du monde entier et comparez vos performances !
        </p>
  
        <div class="leaderboard-filters">
          <div class="filter-group">
            <label for="time-filter">Période :</label>
            <select id="time-filter" v-model="timeFilter">
              <option value="all">Tout le temps</option>
              <option value="month">Ce mois</option>
              <option value="week">Cette semaine</option>
              <option value="day">Aujourd'hui</option>
            </select>
          </div>
        </div>
  
        <div class="top-players" v-if="!isLoading && leaderboard.length > 0">
          <div class="podium">
            <div class="podium-item second-place" v-if="leaderboard.length > 1">
              <div class="medal">🥈</div>
              <div class="avatar">{{ getInitials(leaderboard[1].username) }}</div>
              <div class="player-info">
                <div class="player-name">{{ leaderboard[1].username }}</div>
                <div class="player-score">{{ leaderboard[1].score }} pays</div>
              </div>
            </div>
            <div class="podium-item first-place" v-if="leaderboard.length > 0">
              <div class="medal">🥇</div>
              <div class="avatar">{{ getInitials(leaderboard[0].username) }}</div>
              <div class="player-info">
                <div class="player-name">{{ leaderboard[0].username }}</div>
                <div class="player-score">{{ leaderboard[0].score }} pays</div>
              </div>
            </div>
            <div class="podium-item third-place" v-if="leaderboard.length > 2">
              <div class="medal">🥉</div>
              <div class="avatar">{{ getInitials(leaderboard[2].username) }}</div>
              <div class="player-info">
                <div class="player-name">{{ leaderboard[2].username }}</div>
                <div class="player-score">{{ leaderboard[2].score }} pays</div>
              </div>
            </div>
          </div>
        </div>
  
        <div class="leaderboard-table" v-if="!isLoading && leaderboard.length > 0">
          <div class="table-header">
            <div class="rank-column">Rang</div>
            <div class="player-column">Joueur</div>
            <div class="score-column">Score</div>
            <div class="progress-column">Progression</div>
          </div>
          <div 
            v-for="(player, index) in paginatedLeaderboard" 
            :key="player._id" 
            class="table-row"
            :class="{ 'is-current-user': isCurrentUser(player) }"
          >
            <div class="rank-column">{{ startIndex + index + 1 }}</div>
            <div class="player-column">
              <div class="player-avatar">{{ getInitials(player.username) }}</div>
              <div class="player-name">{{ player.username }}</div>
            </div>
            <div class="score-column">{{ player.score }}</div>
            <div class="progress-column">
              <div class="progress-bar">
                <div 
                  class="progress-value" 
                  :style="{ width: `${(player.score / totalCountries) * 100}%` }"
                ></div>
              </div>
              <span class="progress-text">{{ Math.round((player.score / totalCountries) * 100) }}%</span>
            </div>
          </div>
        </div>
  
        <div class="empty-state" v-else-if="!isLoading && leaderboard.length === 0">
          <p>Aucun joueur trouvé pour le moment.</p>
        </div>
  
        <div class="loading" v-else>
          <p>Chargement du classement...</p>
        </div>
  
        <div class="pagination" v-if="pageCount > 1">
          <button 
            class="pagination-button" 
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            Précédent
          </button>
          <div class="page-numbers">
            <button 
              v-for="page in displayedPages" 
              :key="page"
              class="page-number"
              :class="{ active: currentPage === page }"
              @click="currentPage = page"
            >
              {{ page }}
            </button>
          </div>
          <button 
            class="pagination-button" 
            :disabled="currentPage === pageCount"
            @click="currentPage++"
          >
            Suivant
          </button>
        </div>
  
        <div class="your-rank" v-if="isAuthenticated && userRank">
          <p>
            Votre position : <span class="rank">{{ userRank }}</span> 
            sur {{ leaderboard.length }} joueurs
          </p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'LeaderboardView',
    data() {
      return {
        timeFilter: 'all',
        currentPage: 1,
        perPage: 10,
        totalCountries: 195
      };
    },
    computed: {
      isAuthenticated() {
        return this.$store.getters.isAuthenticated;
      },
      user() {
        return this.$store.getters.user;
      },
      isLoading() {
        return this.$store.getters.statsLoading;
      },
      leaderboard() {
        return this.$store.getters.leaderboard || [];
      },
      userRank() {
        return this.$store.getters.userRank;
      },
      pageCount() {
        return Math.ceil(this.leaderboard.length / this.perPage);
      },
      startIndex() {
        return (this.currentPage - 1) * this.perPage;
      },
      paginatedLeaderboard() {
        const start = this.startIndex;
        return this.leaderboard.slice(start, start + this.perPage);
      },
      displayedPages() {
        const pages = [];
        const maxDisplayedPages = 5;
        
        if (this.pageCount <= maxDisplayedPages) {
          // Si moins de 5 pages, afficher toutes les pages
          for (let i = 1; i <= this.pageCount; i++) {
            pages.push(i);
          }
        } else {
          // Sinon, afficher les pages autour de la page actuelle
          const halfDisplayed = Math.floor(maxDisplayedPages / 2);
          
          let startPage = Math.max(1, this.currentPage - halfDisplayed);
          let endPage = Math.min(this.pageCount, startPage + maxDisplayedPages - 1);
          
          if (endPage - startPage + 1 < maxDisplayedPages) {
            startPage = Math.max(1, endPage - maxDisplayedPages + 1);
          }
          
          for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
          }
        }
        
        return pages;
      }
    },
    methods: {
      getInitials(username) {
        if (!username) return '?';
        return username.substring(0, 2).toUpperCase();
      },
      isCurrentUser(player) {
        return this.user && player.username === this.user.username;
      }
    },
    mounted() {
      this.$store.dispatch('fetchLeaderboard');
      if (this.isAuthenticated) {
        this.$store.dispatch('fetchUserRank');
      }
    },
    watch: {
      timeFilter() {
        // Recharger le classement si le filtre change
        this.$store.dispatch('fetchLeaderboard', { timeFilter: this.timeFilter });
        this.currentPage = 1;
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .leaderboard-view {
    padding: 20px;
  }
  
  .leaderboard-container {
    max-width: 1000px;
    margin: 0 auto;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    padding: 30px;
  }
  
  h1 {
    text-align: center;
    margin-top: 0;
    margin-bottom: 10px;
  }
  
  .leaderboard-description {
    text-align: center;
    color: #666;
    margin-bottom: 30px;
  }
  
  .leaderboard-filters {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 30px;
  }
  
  .filter-group {
    display: flex;
    align-items: center;
  }
  
  .filter-group label {
    margin-right: 10px;
    color: #666;
  }
  
  .filter-group select {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
  }
  
  .top-players {
    margin-bottom: 40px;
  }
  
  .podium {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    height: 260px;
  }
  
  .podium-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 20px;
  }
  
  .first-place {
    transform: translateY(-40px);
  }
  
  .medal {
    font-size: 2rem;
    margin-bottom: 10px;
  }
  
  .avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: #4CAF50;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  .first-place .avatar {
    width: 100px;
    height: 100px;
    font-size: 2rem;
    background-color: #FFC107;
  }
  
  .player-info {
    text-align: center;
  }
  
  .player-name {
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .player-score {
    color: #666;
  }
  
  .leaderboard-table {
    border: 1px solid #eee;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 20px;
  }
  
  .table-header {
    display: flex;
    background-color: #f5f5f5;
    padding: 15px;
    font-weight: bold;
    border-bottom: 1px solid #eee;
  }
  
  .table-row {
    display: flex;
    padding: 15px;
    border-bottom: 1px solid #eee;
    align-items: center;
  }
  
  .table-row:last-child {
    border-bottom: none;
  }
  
  .table-row.is-current-user {
    background-color: #e8f5e9;
  }
  
  .rank-column {
    width: 60px;
    text-align: center;
  }
  
  .player-column {
    flex: 1;
    display: flex;
    align-items: center;
  }
  
  .player-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #4CAF50;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-right: 15px;
  }
  
  .score-column {
    width: 100px;
    text-align: center;
    font-weight: bold;
  }
  
  .progress-column {
    width: 200px;
    display: flex;
    flex-direction: column;
  }
  
  .progress-bar {
    height: 8px;
    background-color: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 5px;
  }
  
  .progress-value {
    height: 100%;
    background-color: #4CAF50;
    border-radius: 4px;
  }
  
  .progress-text {
    font-size: 0.8rem;
    color: #666;
    text-align: right;
  }
  
  .empty-state, .loading {
    text-align: center;
    padding: 40px 0;
    color: #666;
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
  }
  
  .pagination-button {
    padding: 8px 15px;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .pagination-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .page-numbers {
    display: flex;
    margin: 0 10px;
  }
  
  .page-number {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 5px;
    border: 1px solid #ddd;
    background-color: white;
    cursor: pointer;
  }
  
  .page-number.active {
    background-color: #4CAF50;
    color: white;
    border-color: #4CAF50;
  }
  
  .your-rank {
    text-align: center;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }
  
  .your-rank p {
    color: #666;
  }
  
  .your-rank .rank {
    font-weight: bold;
    font-size: 1.2rem;
    color: #4CAF50;
  }
  
  @media (max-width: 768px) {
    .podium {
      flex-direction: column;
      align-items: center;
      height: auto;
    }
    
    .podium-item {
      margin: 20px 0;
    }
    
    .first-place {
      order: -1;
      transform: none;
    }
    
    .progress-column {
      display: none;
    }
  }
  </style>