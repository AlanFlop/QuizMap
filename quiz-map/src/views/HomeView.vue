<template>
  <div class="home-page">
    <!-- Hero Banner -->
    <HeroBanner />
    
    <!-- Section À propos -->
    <section class="about-section">
      <div class="container">
        <div class="section-header">
          <h2>Découvrez le monde et devenez un champion</h2>
          <p class="subtitle">Testez vos connaissances et rejoignez les candidats de l'émission</p>
        </div>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🌍</div>
            <h3>Défi mondial</h3>
            <p>Testez vos connaissances géographiques en identifiant tous les pays du monde et leurs capitales.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🏆</div>
            <h3>Sélection officielle</h3>
            <p>Les meilleurs joueurs seront contactés pour participer à l'émission télévisée "Questions pour un Champion".</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">⏱️</div>
            <h3>Contre la montre</h3>
            <p>Affrontez le chronomètre comme dans l'émission et battez vos records pour vous démarquer.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🧠</div>
            <h3>Culture générale</h3>
            <p>Des questions variées sur différents domaines pour enrichir votre savoir et vous préparer aux défis.</p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Section des défis -->
    <section class="challenges-section">
      <div class="container">
        <div class="section-header">
          <h2>Les défis qui vous attendent</h2>
          <p class="subtitle">Relevez ces défis pour vous qualifier</p>
        </div>
        
        <div class="challenges-grid">
          <div class="challenge-card">
            <div class="challenge-image">
              <img src="/assets/images/world-map-challenge.jpg" alt="Carte du monde" />
              <div class="challenge-difficulty">
                <span>Niveau 1</span>
              </div>
            </div>
            <div class="challenge-content">
              <h3>Pays du Monde</h3>
              <p>Identifiez les 197 pays du monde sur la carte interactive</p>
              <div class="challenge-meta">
                <span><i class="fas fa-users"></i> 8,542 joueurs</span>
                <span><i class="fas fa-star"></i> 4.8/5</span>
              </div>
              <router-link to="/jeu/pays" class="btn-challenge">Commencer</router-link>
            </div>
          </div>
          
          <div class="challenge-card">
            <div class="challenge-image">
              <img src="/assets/images/capitals-challenge.jpg" alt="Capitales" />
              <div class="challenge-difficulty">
                <span>Niveau 2</span>
              </div>
            </div>
            <div class="challenge-content">
              <h3>Capitales</h3>
              <p>Associez chaque pays à sa capitale en temps limité</p>
              <div class="challenge-meta">
                <span><i class="fas fa-users"></i> 6,321 joueurs</span>
                <span><i class="fas fa-star"></i> 4.6/5</span>
              </div>
              <router-link to="/jeu/capitales" class="btn-challenge">Commencer</router-link>
            </div>
          </div>
          
          <div class="challenge-card">
            <div class="challenge-image">
              <img src="/assets/images/flags-challenge.jpg" alt="Drapeaux" />
              <div class="challenge-difficulty">
                <span>Niveau 3</span>
              </div>
            </div>
            <div class="challenge-content">
              <h3>Drapeaux</h3>
              <p>Reconnaissez les drapeaux de tous les pays</p>
              <div class="challenge-meta">
                <span><i class="fas fa-users"></i> 5,873 joueurs</span>
                <span><i class="fas fa-star"></i> 4.7/5</span>
              </div>
              <router-link to="/jeu/drapeaux" class="btn-challenge">Commencer</router-link>
            </div>
          </div>
          
          <div class="challenge-card">
            <div class="challenge-image">
              <img src="/assets/images/quiz-challenge.jpg" alt="Quiz" />
              <div class="challenge-difficulty">
                <span>Niveau 4</span>
              </div>
            </div>
            <div class="challenge-content">
              <h3>Quiz Culture Générale</h3>
              <p>Testez vos connaissances sur divers sujets</p>
              <div class="challenge-meta">
                <span><i class="fas fa-users"></i> 7,124 joueurs</span>
                <span><i class="fas fa-star"></i> 4.9/5</span>
              </div>
              <router-link to="/jeu/quiz" class="btn-challenge">Commencer</router-link>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Section Classement -->
    <section class="leaderboard-section">
      <div class="container">
        <div class="section-header">
          <h2>Les champions du moment</h2>
          <p class="subtitle">Rejoignez l'élite des joueurs</p>
        </div>
        
        <div class="leaderboard-container">
          <div class="leaderboard-table">
            <table>
              <thead>
                <tr>
                  <th>Rang</th>
                  <th>Joueur</th>
                  <th>Score</th>
                  <th>Pays découverts</th>
                  <th>Progression</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(player, index) in topPlayers" :key="player.id">
                  <td class="rank-cell">
                    <div class="rank" :class="{ 'top-rank': index < 3 }">{{ index + 1 }}</div>
                  </td>
                  <td class="player-cell">
                    <div class="player-info">
                      <div class="player-avatar" :style="{ backgroundColor: getAvatarColor(player.name) }">
                        {{ getInitials(player.name) }}
                      </div>
                      <span>{{ player.name }}</span>
                    </div>
                  </td>
                  <td class="score-cell">{{ formatNumber(player.score) }} pts</td>
                  <td>{{ player.countries }}/197</td>
                  <td>
                    <div class="progress-bar">
                      <div class="progress" :style="{ width: `${(player.countries / 197) * 100}%` }"></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="leaderboard-action">
            <router-link to="/classement" class="btn-view-all">
              Voir le classement complet
              <i class="fas fa-arrow-right"></i>
            </router-link>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Section témoignages -->
    <section class="testimonials-section">
      <div class="container">
        <div class="section-header">
          <h2>Ils sont passés de notre plateforme à l'émission</h2>
          <p class="subtitle">Découvrez leurs expériences</p>
        </div>
        
        <div class="testimonials-container">
          <div class="testimonial-card">
            <div class="testimonial-content">
              <i class="fas fa-quote-left quote-icon"></i>
              <p>Grâce à cette plateforme, j'ai pu m'entraîner quotidiennement sur mes connaissances géographiques. Après 3 mois d'entraînement intensif, j'ai été sélectionné pour l'émission et j'ai pu réaliser mon rêve !</p>
            </div>
            <div class="testimonial-author">
              <div class="author-image">
                <img src="/assets/images/testimonial-1.jpg" alt="Thomas Dubois" />
              </div>
              <div class="author-info">
                <h4>Thomas Dubois</h4>
                <p>Champion - Saison 2023</p>
              </div>
            </div>
          </div>
          
          <div class="testimonial-card">
            <div class="testimonial-content">
              <i class="fas fa-quote-left quote-icon"></i>
              <p>J'ai toujours été passionnée de culture générale, mais c'est en découvrant ce site que j'ai vraiment pu mesurer mon niveau et l'améliorer. Les défis sont variés et vraiment dans l'esprit de l'émission !</p>
            </div>
            <div class="testimonial-author">
              <div class="author-image">
                <img src="/assets/images/testimonial-2.jpg" alt="Marie Laurent" />
              </div>
              <div class="author-info">
                <h4>Marie Laurent</h4>
                <p>Finaliste - Saison 2022</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Call to action -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2>Prêt à relever le défi ?</h2>
          <p>Inscrivez-vous gratuitement et commencez votre parcours vers Questions pour un Champion</p>
          <div class="cta-buttons">
            <router-link to="/inscription" class="btn-cta-primary">S'inscrire maintenant</router-link>
            <router-link to="/jeu" class="btn-cta-secondary">Essayer sans inscription</router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import HeroBanner from '@/components/HeroBanner.vue'

export default {
  components: {
    HeroBanner
  },
  
  data() {
    return {
      topPlayers: [
        { id: 1, name: 'Jean Dupont', score: 9850, countries: 195 },
        { id: 2, name: 'Marie Laurent', score: 9720, countries: 193 },
        { id: 3, name: 'Thomas Dubois', score: 9650, countries: 190 },
        { id: 4, name: 'Léa Martin', score: 9580, countries: 189 },
        { id: 5, name: 'Pierre Rousseau', score: 9510, countries: 188 }
      ]
    }
  },
  methods: {
    getInitials(name) {
      return name.split(' ').map(part => part.charAt(0)).join('').toUpperCase();
    },
    getAvatarColor(name) {
      // Générer une couleur à partir du nom
      const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const colors = [
        '#4299E1', '#4FD1C5', '#68D391', '#F6AD55', '#F687B3',
        '#805AD5', '#667EEA', '#ED64A6', '#48BB78', '#E53E3E'
      ];
      return colors[hash % colors.length];
    },
    formatNumber(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
  }
}
</script>

<style lang="scss" scoped>
// Variables
$primary-color: #3b82f6;
$secondary-color: #8b5cf6;
$accent-color: #f97316;
$text-color: #1e293b;
$light-text: #64748b;
$background-color: #ffffff;
$light-bg: #f1f5f9;
$border-radius: 12px;
$box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);

// Global styles
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

// Section Headers
.section-header {
  text-align: center;
  margin-bottom: 60px;
  
  h2 {
    font-size: 2.5rem;
    font-weight: 800;
    color: $text-color;
    margin-bottom: 1rem;
    
    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }
  
  .subtitle {
    font-size: 1.25rem;
    color: $light-text;
    max-width: 700px;
    margin: 0 auto;
    
    @media (max-width: 768px) {
      font-size: 1.1rem;
    }
  }
}

// About Section
.about-section {
  padding: 100px 0;
  background-color: $background-color;
  
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
    
    .feature-card {
      background-color: $light-bg;
      border-radius: $border-radius;
      padding: 30px;
      text-align: center;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      
      &:hover {
        transform: translateY(-10px);
        box-shadow: $box-shadow;
      }
      
      .feature-icon {
        font-size: 3rem;
        margin-bottom: 20px;
      }
      
      h3 {
        font-size: 1.5rem;
        color: $text-color;
        margin-bottom: 15px;
      }
      
      p {
        color: $light-text;
        line-height: 1.6;
      }
    }
  }
}

// Challenges Section
.challenges-section {
  padding: 100px 0;
  background-color: $light-bg;
  
  .challenges-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
    
    .challenge-card {
      background-color: $background-color;
      border-radius: $border-radius;
      overflow: hidden;
      box-shadow: $box-shadow;
      transition: transform 0.3s ease;
      
      &:hover {
        transform: translateY(-10px);
      }
      
      .challenge-image {
        position: relative;
        height: 180px;
        overflow: hidden;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        
        .challenge-difficulty {
          position: absolute;
          top: 15px;
          right: 15px;
          background-color: rgba(0, 0, 0, 0.7);
          padding: 5px 10px;
          border-radius: 20px;
          
          span {
            color: white;
            font-size: 0.8rem;
            font-weight: 600;
          }
        }
      }
      
      &:hover .challenge-image img {
        transform: scale(1.1);}
      
      .challenge-content {
        padding: 25px;
        
        h3 {
          font-size: 1.3rem;
          color: $text-color;
          margin-bottom: 10px;
          font-weight: 700;
        }
        
        p {
          color: $light-text;
          margin-bottom: 20px;
          min-height: 50px;
        }
        
        .challenge-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          font-size: 0.9rem;
          color: $light-text;
          
          i {
            color: $primary-color;
            margin-right: 5px;
          }
        }
        
        .btn-challenge {
          display: block;
          background-color: $primary-color;
          color: white;
          text-align: center;
          padding: 12px;
          border-radius: $border-radius;
          text-decoration: none;
          font-weight: 600;
          transition: background-color 0.3s ease;
          
          &:hover {
            background-color: darken($primary-color, 10%);
          }
        }
      }
    }
  }
}

// Leaderboard Section
.leaderboard-section {
  padding: 100px 0;
  background-color: $background-color;
  
  .leaderboard-container {
    background-color: $light-bg;
    border-radius: $border-radius;
    overflow: hidden;
    box-shadow: $box-shadow;
    
    .leaderboard-table {
      width: 100%;
      overflow-x: auto;
      
      table {
        width: 100%;
        border-collapse: collapse;
        
        th {
          background-color: $primary-color;
          color: white;
          text-align: left;
          padding: 15px 20px;
          font-weight: 600;
        }
        
        td {
          padding: 15px 20px;
          border-bottom: 1px solid #e2e8f0;
          
          &.rank-cell {
            width: 80px;
          }
          
          .rank {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background-color: #e2e8f0;
            color: $text-color;
            font-weight: 700;
            
            &.top-rank {
              background-color: $accent-color;
              color: white;
            }
          }
          
          &.player-cell {
            min-width: 200px;
          }
          
          .player-info {
            display: flex;
            align-items: center;
            
            .player-avatar {
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background-color: $primary-color;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 700;
              margin-right: 10px;
            }
          }
          
          &.score-cell {
            font-weight: 700;
            color: $primary-color;
          }
          
          .progress-bar {
            height: 8px;
            background-color: #e2e8f0;
            border-radius: 4px;
            overflow: hidden;
            
            .progress {
              height: 100%;
              background-color: $primary-color;
              border-radius: 4px;
            }
          }
        }
        
        tr:hover td {
          background-color: #f8fafc;
        }
      }
    }
    
    .leaderboard-action {
      padding: 25px;
      text-align: center;
      background-color: white;
      
      .btn-view-all {
        display: inline-flex;
        align-items: center;
        background-color: transparent;
        color: $primary-color;
        padding: 10px 20px;
        border-radius: $border-radius;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s ease;
        border: 2px solid $primary-color;
        
        i {
          margin-left: 10px;
          transition: transform 0.3s ease;
        }
        
        &:hover {
          background-color: $primary-color;
          color: white;
          
          i {
            transform: translateX(5px);
          }
        }
      }
    }
  }
}

// Testimonials Section
.testimonials-section {
  padding: 100px 0;
  background-color: $light-bg;
  
  .testimonials-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 30px;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
    
    .testimonial-card {
      background-color: $background-color;
      border-radius: $border-radius;
      padding: 30px;
      box-shadow: $box-shadow;
      transition: transform 0.3s ease;
      
      &:hover {
        transform: translateY(-10px);
      }
      
      .testimonial-content {
        position: relative;
        margin-bottom: 25px;
        
        .quote-icon {
          font-size: 2rem;
          color: #e2e8f0;
          position: absolute;
          top: -10px;
          left: -5px;
        }
        
        p {
          position: relative;
          z-index: 1;
          color: $text-color;
          line-height: 1.8;
          font-style: italic;
          padding-left: 25px;
        }
      }
      
      .testimonial-author {
        display: flex;
        align-items: center;
        
        .author-image {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          margin-right: 15px;
          border: 3px solid $primary-color;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
        
        .author-info {
          h4 {
            font-size: 1.1rem;
            color: $text-color;
            margin: 0 0 5px 0;
          }
          
          p {
            color: $light-text;
            font-size: 0.9rem;
            margin: 0;
          }
        }
      }
    }
  }
}

// CTA Section
.cta-section {
  padding: 100px 0;
  background: linear-gradient(135deg, $primary-color 0%, $secondary-color 100%);
  
  .cta-content {
    text-align: center;
    color: white;
    max-width: 700px;
    margin: 0 auto;
    
    h2 {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 20px;
      
      @media (max-width: 768px) {
        font-size: 2rem;
      }
    }
    
    p {
      font-size: 1.2rem;
      margin-bottom: 30px;
      opacity: 0.9;
      
      @media (max-width: 768px) {
        font-size: 1rem;
      }
    }
    
    .cta-buttons {
      display: flex;
      gap: 20px;
      justify-content: center;
      
      @media (max-width: 768px) {
        flex-direction: column;
        gap: 15px;
      }
      
      .btn-cta-primary, .btn-cta-secondary {
        padding: 15px 30px;
        border-radius: $border-radius;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s ease;
        
        @media (max-width: 768px) {
          padding: 12px 20px;
        }
      }
      
      .btn-cta-primary {
        background-color: white;
        color: $primary-color;
        
        &:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
      }
      
      .btn-cta-secondary {
        background-color: transparent;
        border: 2px solid white;
        color: white;
        
        &:hover {
          background-color: rgba(255, 255, 255, 0.1);
          transform: translateY(-5px);
        }
      }
    }
  }
}

// Responsive Adjustments
@media (max-width: 768px) {
  section {
    padding: 60px 0;
  }
}
</style>