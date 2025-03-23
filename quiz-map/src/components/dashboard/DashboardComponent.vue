<template>
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Tableau de bord</h1>
        <p class="welcome-message">Bienvenue, {{ user.username }} !</p>
      </div>
  
      <div class="dashboard-cards">
        <!-- Carte de progression -->
        <div class="dashboard-card">
          <div class="card-icon progress-icon">
            <span class="material-icons">explore</span>
          </div>
          <div class="card-content">
            <h3>Votre progression</h3>
            <div class="progress-stats">
              <div class="progress-circle">
                <svg viewBox="0 0 36 36" class="circular-chart">
                  <path class="circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path class="circle"
                    :stroke-dasharray="`${stats.percentage}, 100`"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" class="percentage">{{ stats.percentage }}%</text>
                </svg>
              </div>
              <div class="progress-text">
                <p>{{ stats.discovered }} sur {{ stats.total }} pays découverts</p>
                <router-link to="/play" class="continue-btn">Continuer à jouer</router-link>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Carte du classement -->
        <div class="dashboard-card">
          <div class="card-icon leaderboard-icon">
            <span class="material-icons">leaderboard</span>
          </div>
          <div class="card-content">
            <h3>Classement</h3>
            <p class="rank-info">Votre rang : <span class="rank">{{ userRank }}</span></p>
            <div class="leaderboard-preview">
              <div v-for="(player, index) in topPlayers" :key="player._id" 
                   :class="['leaderboard-item', { 'is-user': player.username === user.username }]">
                <span class="rank-number">{{ index + 1 }}</span>
                <span class="player-name">{{ player.username }}</span>
                <span class="player-score">{{ player.score }} pays</span>
              </div>
            </div>
            <router-link to="/leaderboard" class="view-all">Voir tout le classement</router-link>
          </div>
        </div>
      </div>
  
      <!-- Statistiques par continent -->
      <div class="continent-stats">
        <h3>Progression par continent</h3>
        <div class="continent-grid">
          <div v-for="(continent, name) in stats.continents" :key="name" class="continent-card">
            <h4>{{ name }}</h4>
            <div class="continent-progress">
              <div class="progress-bar">
                <div class="progress-value" 
                     :style="{ width: `${(continent.discovered / continent.total) * 100}%` }"></div>
              </div>
              <div class="continent-numbers">
                <span>{{ continent.discovered }}/{{ continent.total }}</span>
                <span>{{ Math.round((continent.discovered / continent.total) * 100) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Découvertes récentes -->
      <div class="recent-discoveries">
        <h3>Découvertes récentes</h3>
        <div class="discoveries-list" v-if="stats.recentDiscoveries && stats.recentDiscoveries.length > 0">
          <div v-for="discovery in stats.recentDiscoveries" :key="discovery._id" class="discovery-item">
            <span class="flag-icon">🌎</span>
            <div class="discovery-details">
              <span class="country-name">{{ discovery.countryName }}</span>
              <span class="discovery-date">{{ formatDate(discovery.discoveredAt) }}</span>
            </div>
          </div>
        </div>
        <p v-else class="no-discoveries">Vous n'avez pas encore découvert de pays.</p>
      </div>
  
      <!-- Défis et trophées -->
      <div class="challenges-trophies">
        <h3>Défis et trophées</h3>
        <div class="trophies-grid">
          <div v-for="trophy in trophies" :key="trophy.id" 
               :class="['trophy-card', { 'unlocked': trophy.unlocked }]">
            <div class="trophy-icon">
              <span class="material-icons">{{ trophy.icon }}</span>
            </div>
            <div class="trophy-info">
              <h4>{{ trophy.name }}</h4>
              <p>{{ trophy.description }}</p>
              <div class="trophy-progress" v-if="!trophy.unlocked">
                <div class="progress-bar">
                  <div class="progress-value" 
                       :style="{ width: `${trophy.progress}%` }"></div>
                </div>
                <span>{{ trophy.progressText }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'DashboardComponent',
    data() {
      return {
        trophies: [
          {
            id: 'europe_master',
            name: 'Maître de l\'Europe',
            description: 'Découvrez tous les pays d\'Europe',
            icon: 'emoji_events',
            unlocked: false,
            progress: 0,
            progressText: '0/44'
          },
          {
            id: 'africa_explorer',
            name: 'Explorateur d\'Afrique',
            description: 'Découvrez tous les pays d\'Afrique',
            icon: 'emoji_events',
            unlocked: false,
            progress: 0,
            progressText: '0/54'
          },
          {
            id: 'asia_traveler',
            name: 'Voyageur d\'Asie',
            description: 'Découvrez tous les pays d\'Asie',
            icon: 'emoji_events',
            unlocked: false,
            progress: 0,
            progressText: '0/48'
          },
          {
            id: 'americas_pioneer',
            name: 'Pionnier des Amériques',
            description: 'Découvrez tous les pays d\'Amérique du Nord et du Sud',
            icon: 'emoji_events',
            unlocked: false,
            progress: 0,
            progressText: '0/35'
          },
          {
            id: 'world_master',
            name: 'Maître du Monde',
            description: 'Découvrez tous les pays du monde',
            icon: 'workspace_premium',
            unlocked: false,
            progress: 0,
            progressText: '0/195'
          }
        ]
      };
    },
    computed: {
      user() {
        return this.$store.getters.user || { username: 'Visiteur' };
      },
      stats() {
        return this.$store.getters.userStats || {
          discovered: 0,
          total: 195,
          percentage: 0,
          continents: {},
          recentDiscoveries: []
        };
      },
      topPlayers() {
        return this.$store.getters.leaderboard.slice(0, 5) || [];
      },
      userRank() {
        return this.$store.getters.userRank || '-';
      },
      isLoading() {
        return this.$store.getters.statsLoading;
      }
    },
    methods: {
      formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      },
      
      updateTrophies() {
        // Mise à jour des trophées en fonction des continents
        if (this.stats.continents['Europe']) {
          const europe = this.stats.continents['Europe'];
          const trophyEurope = this.trophies.find(t => t.id === 'europe_master');
          trophyEurope.progress = Math.round((europe.discovered / europe.total) * 100);
          trophyEurope.progressText = `${europe.discovered}/${europe.total}`;
          trophyEurope.unlocked = europe.discovered === europe.total;
        }
        
        if (this.stats.continents['Afrique']) {
          const africa = this.stats.continents['Afrique'];
          const trophyAfrica = this.trophies.find(t => t.id === 'africa_explorer');
          trophyAfrica.progress = Math.round((africa.discovered / africa.total) * 100);
          trophyAfrica.progressText = `${africa.discovered}/${africa.total}`;
          trophyAfrica.unlocked = africa.discovered === africa.total;
        }
        
        if (this.stats.continents['Asie']) {
          const asia = this.stats.continents['Asie'];
          const trophyAsia = this.trophies.find(t => t.id === 'asia_traveler');
          trophyAsia.progress = Math.round((asia.discovered / asia.total) * 100);
          trophyAsia.progressText = `${asia.discovered}/${asia.total}`;
          trophyAsia.unlocked = asia.discovered === asia.total;
        }
        
        // Trophée maître du monde
        const worldMaster = this.trophies.find(t => t.id === 'world_master');
        worldMaster.progress = this.stats.percentage;
        worldMaster.progressText = `${this.stats.discovered}/${this.stats.total}`;
        worldMaster.unlocked = this.stats.discovered === this.stats.total;
      }
    },
    mounted() {
      // Vérifier si l'utilisateur est connecté
      if (!this.$store.getters.isAuthenticated) {
        this.$router.push('/login?redirect=/dashboard');
        return;
      }
      
      // Charger les données nécessaires
      this.$store.dispatch('fetchUserStats');
      this.$store.dispatch('fetchLeaderboard');
      this.$store.dispatch('fetchUserRank');
    },
    watch: {
      stats: {
        handler() {
          this.updateTrophies();
        },
        deep: true,
        immediate: true
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .dashboard-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .dashboard-header {
    margin-bottom: 30px;
  }
  
  .welcome-message {
    color: #666;
    font-size: 1.1rem;
  }
  
  .dashboard-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }
  
  .dashboard-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    padding: 20px;
    display: flex;
    align-items: center;
  }
  
  .card-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
  }
  
  .progress-icon {
    background-color: #e3f2fd;
    color: #1976d2;
  }
  
  .leaderboard-icon {
    background-color: #fff8e1;
    color: #ffb300;
  }
  
  .card-icon .material-icons {
    font-size: 30px;
  }
  
  .card-content {
    flex: 1;
  }
  
  .card-content h3 {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 1.2rem;
  }
  
  .progress-stats {
    display: flex;
    align-items: center;
  }
  
  .progress-circle {
    width: 80px;
    height: 80px;
    margin-right: 15px;
  }
  
  .circular-chart {
    display: block;
    width: 100%;
    height: 100%;
  }
  
  .circle-bg {
    fill: none;
    stroke: #eee;
    stroke-width: 3.8;
  }
  
  .circle {
    fill: none;
    stroke: #4CAF50;
    stroke-width: 2.8;
    stroke-linecap: round;
    animation: progress 1s ease-out forwards;
  }
  
  @keyframes progress {
    0% {
      stroke-dasharray: 0 100;
    }
  }
  
  .percentage {
    fill: #4CAF50;
    font-size: 0.5em;
    text-anchor: middle;
    font-weight: bold;
  }
  
  .progress-text p {
    margin: 0 0 10px 0;
    font-size: 0.9rem;
  }
  
  .continue-btn {
    display: inline-block;
    background-color: #4CAF50;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    text-decoration: none;
    font-size: 0.9rem;
    transition: background-color 0.3s;
  }
  
  .continue-btn:hover {
    background-color: #388E3C;
  }
  
  .rank-info {
    margin-bottom: 15px;
  }
  
  .rank {
    font-weight: bold;
    font-size: 1.2rem;
    color: #ff9800;
  }
  
  .leaderboard-preview {
    margin-bottom: 15px;
  }
  
  .leaderboard-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .leaderboard-item:last-child {
    border-bottom: none;
  }
  
  .leaderboard-item.is-user {
    background-color: #f9f9f9;
    border-radius: 4px;
    padding: 8px;
    font-weight: bold;
  }
  
  .rank-number {
    width: 25px;
    text-align: center;
    font-weight: bold;
  }
  
  .player-name {
    flex: 1;
    padding: 0 10px;
  }
  
  .player-score {
    color: #666;
  }
  
  .view-all {
    display: block;
    text-align: center;
    color: #1976d2;
    text-decoration: none;
    margin-top: 10px;
    font-size: 0.9rem;
  }
  
  .view-all:hover {
    text-decoration: underline;
  }
  
  .continent-stats, .recent-discoveries, .challenges-trophies {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    padding: 20px;
    margin-bottom: 30px;
  }
  
  .continent-stats h3, .recent-discoveries h3, .challenges-trophies h3 {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 1.2rem;
  }
  
  .continent-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }
  
  .continent-card {
    background-color: #f9f9f9;
    border-radius: 6px;
    padding: 15px;
  }
  
  .continent-card h4 {
    margin-top: 0;
    margin-bottom: 10px;
  }
  
  .continent-progress {
    margin-top: 10px;
  }
  
  .progress-bar {
    height: 10px;
    background-color: #e0e0e0;
    border-radius: 5px;
    overflow: hidden;
    margin-bottom: 5px;
  }
  
  .progress-value {
    height: 100%;
    background-color: #4CAF50;
    border-radius: 5px;
    transition: width 0.5s ease;
  }
  
  .continent-numbers {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    color: #666;
  }
  
  .discoveries-list {
    max-height: 300px;
    overflow-y: auto;
  }
  
  .discovery-item {
    display: flex;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .discovery-item:last-child {
    border-bottom: none;
  }
  
  .flag-icon {
    font-size: 1.5rem;
    margin-right: 15px;
  }
  
  .discovery-details {
    display: flex;
    flex-direction: column;
  }
  
  .country-name {
    font-weight: 500;
  }
  
  .discovery-date {
    font-size: 0.8rem;
    color: #666;
  }
  
  .no-discoveries {
    color: #666;
    font-style: italic;
  }
  
  .trophies-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }
  
  .trophy-card {
    display: flex;
    padding: 15px;
    border-radius: 6px;
    background-color: #f9f9f9;
    border-left: 4px solid #ccc;
  }
  
  .trophy-card.unlocked {
    border-left-color: #FFD700;
    background-color: #FFF9C4;
  }
  
  .trophy-icon {
    margin-right: 15px;
    color: #9E9E9E;
  }
  
  .trophy-card.unlocked .trophy-icon {
    color: #FFD700;
  }
  
  .trophy-info {
    flex: 1;
  }
  
  .trophy-info h4 {
    margin-top: 0;
    margin-bottom: 5px;
  }
  
  .trophy-info p {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 0.9rem;
    color: #666;
  }
  
  .trophy-progress {
    margin-top: 10px;
  }
  
  @media (max-width: 768px) {
    .dashboard-cards,
    .continent-grid,
    .trophies-grid {
      grid-template-columns: 1fr;
    }
    
    .progress-stats {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .progress-circle {
      margin-right: 0;
      margin-bottom: 15px;
    }
  }
  </style>