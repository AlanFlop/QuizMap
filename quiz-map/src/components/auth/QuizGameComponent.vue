<template>
    <div class="quiz-game-container">
      <!-- Sélection du quiz -->
      <div class="quiz-selection" v-if="!selectedQuiz && !gameStarted">
        <h2>Sélectionnez un quiz</h2>
        <p class="intro-text">Choisissez parmi nos quiz personnalisés pour tester vos connaissances.</p>
        
        <div class="quizzes-grid">
          <div 
            v-for="quiz in availableQuizzes" 
            :key="quiz.id" 
            class="quiz-card"
            @click="selectQuiz(quiz)"
          >
            <div class="quiz-card-header">
              <div class="difficulty-badge" :class="'level-' + quiz.difficulty">
                {{ getDifficultyLabel(quiz.difficulty) }}
              </div>
            </div>
            <div class="quiz-card-content">
              <h3>{{ quiz.name }}</h3>
              <p>{{ quiz.description }}</p>
              <div class="quiz-meta">
                <span>{{ getQuizCountriesCount(quiz) }} pays</span>
              </div>
            </div>
            <div class="quiz-card-footer">
              <button class="btn-play">Jouer</button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Détails du quiz sélectionné -->
      <div class="quiz-details" v-if="selectedQuiz && !gameStarted">
        <div class="back-link" @click="selectedQuiz = null">
          <i class="fas fa-arrow-left"></i> Retour à la liste
        </div>
        
        <div class="quiz-header">
          <h2>{{ selectedQuiz.name }}</h2>
          <div class="difficulty-badge" :class="'level-' + selectedQuiz.difficulty">
            {{ getDifficultyLabel(selectedQuiz.difficulty) }}
          </div>
        </div>
        
        <p class="quiz-description">{{ selectedQuiz.description }}</p>
        
        <div class="quiz-stats">
          <div class="stat-item">
            <div class="stat-value">{{ getQuizCountriesCount(selectedQuiz) }}</div>
            <div class="stat-label">Pays à trouver</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ getQuizContinentsCount(selectedQuiz) }}</div>
            <div class="stat-label">Continents</div>
          </div>
          <div class="stat-item" v-if="userBestTime">
            <div class="stat-value">{{ formatTime(userBestTime) }}</div>
            <div class="stat-label">Votre record</div>
          </div>
        </div>
        
        <div class="quiz-actions">
          <button class="btn-start" @click="startGame">Commencer le quiz</button>
        </div>
      </div>
  
      <!-- Jeu en cours -->
      <div class="world-map-container" v-if="gameStarted">
        <div class="game-header">
          <div class="game-info">
            <h2>{{ selectedQuiz.name }}</h2>
            <div class="quiz-progress">
              <span>Découverts: {{ discoveredCount }}/{{ totalQuizCountries }}</span>
              <div class="progress-bar">
                <div 
                  class="progress" 
                  :style="{ width: `${(discoveredCount / totalQuizCountries) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
          
          <!-- Timer et contrôles de jeu -->
          <div class="game-controls">
            <div class="timer">
              <span class="timer-label">Temps écoulé:</span>
              <span class="timer-value">{{ formatTime(elapsedSeconds) }}</span>
            </div>
            <div class="control-buttons">
              <button 
                @click="pauseGame" 
                class="control-btn pause-btn"
                :disabled="gamePaused"
              >
                Pause
              </button>
              <button 
                @click="resumeGame" 
                class="control-btn resume-btn"
                :disabled="!gamePaused"
              >
                Reprendre
              </button>
              <button 
                @click="stopGame" 
                class="control-btn stop-btn"
              >
                Abandonner
              </button>
            </div>
          </div>
        </div>
  
        <div class="input-container" :class="{ 'disabled': gamePaused }">
          <input 
            v-model="countryGuess" 
            @keyup.enter="checkCountry"
            placeholder="Entrez le nom d'un pays..." 
            ref="countryInput"
            :disabled="gamePaused"
          />
          <button 
            @click="checkCountry"
            :disabled="gamePaused"
          >
            Valider
          </button>
        </div>
  
        <div class="feedback" v-if="feedback">
          <p :class="feedbackType">{{ feedback }}</p>
        </div>
  
        <div class="map-container">
          <object 
            ref="svgObject" 
            type="image/svg+xml" 
            data="/assets/maps/world-1.svg" 
            @load="onSvgLoaded"
            class="world-map">
            Votre navigateur ne supporte pas les SVG.
          </object>
        </div>
  
        <div class="recently-discovered" v-if="recentDiscoveries.length > 0">
          <h3>Découvertes récentes:</h3>
          <div class="discoveries-list">
            <span v-for="country in recentDiscoveries" :key="country.id">
              {{ country.name_fr || country.name }}
            </span>
          </div>
        </div>
      </div>
  
      <!-- Modal de fin de jeu -->
      <div class="game-over-modal" v-if="showGameOverModal">
        <div class="modal-content">
          <h3>{{ gameCompleted ? 'Félicitations !' : 'Quiz abandonné' }}</h3>
          
          <div class="game-stats">
            <div class="stat-item">
              <div class="stat-value">{{ formatTime(elapsedSeconds) }}</div>
              <div class="stat-label">Temps total</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ discoveredCount }}</div>
              <div class="stat-label">Pays découverts</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ totalQuizCountries - discoveredCount }}</div>
              <div class="stat-label">Pays restants</div>
            </div>
          </div>
          
          <div class="game-over-message" v-if="gameCompleted">
            <p>Vous avez complété le quiz "{{ selectedQuiz.name }}" !</p>
            <p v-if="isNewRecord">🏆 Nouveau record personnel !</p>
          </div>
          
          <div class="undiscovered-countries" v-if="!gameCompleted && undiscoveredCountries.length > 0">
            <h4>Pays non découverts:</h4>
            <div class="countries-list">
              <span v-for="country in undiscoveredCountries" :key="country.code">
                {{ country.name_fr || country.name }}
              </span>
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="btn-restart" @click="restartQuiz">Rejouer</button>
            <button class="btn-change-quiz" @click="changeQuiz">Changer de quiz</button>
          </div>
        </div>
      </div>
  
      <!-- Modal de pause -->
      <div class="pause-modal" v-if="gamePaused && !showGameOverModal">
        <div class="modal-content">
          <h3>Jeu en pause</h3>
          <p>Le temps est arrêté. Prêt à continuer ?</p>
          
          <div class="modal-actions">
            <button class="btn-resume" @click="resumeGame">Reprendre</button>
            <button class="btn-quit" @click="confirmQuit">Abandonner</button>
          </div>
        </div>
      </div>
  
      <!-- Modal de confirmation d'abandon -->
      <div class="confirm-modal" v-if="showConfirmModal">
        <div class="modal-content">
          <h3>Confirmer l'abandon</h3>
          <p>Êtes-vous sûr de vouloir abandonner cette partie ? Votre progression ne sera pas sauvegardée.</p>
          
          <div class="modal-actions">
            <button class="btn-cancel" @click="showConfirmModal = false">Annuler</button>
            <button class="btn-confirm" @click="confirmStop">Oui, abandonner</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'QuizGameComponent',
    data() {
      return {
        // État du jeu
        availableQuizzes: [],
        selectedQuiz: null,
        gameStarted: false,
        gamePaused: false,
        gameCompleted: false,
        showGameOverModal: false,
        showConfirmModal: false,
        
        // Données de jeu
        countries: [], // Liste complète des pays
        quizCountries: [], // Pays filtrés pour le quiz
        discoveries: [], // Codes des pays découverts
        recentDiscoveries: [], // Derniers pays découverts
        
        // Input
        countryGuess: '',
        feedback: '',
        feedbackType: '',
        feedbackTimeout: null,
        
        // Timer
        elapsedSeconds: 0,
        timerInterval: null,
        startTime: null,
        pausedTime: 0,
        
        // SVG
        svgDocument: null,
        svgLoaded: false,
        
        // Records
        userBestTime: null,
        isNewRecord: false,
        
        // État temporaire
        undiscoveredCountries: []
      }
    },
    computed: {
      totalQuizCountries() {
        return this.quizCountries.length;
      },
      discoveredCount() {
        return this.discoveries.length;
      }
    },
    mounted() {
      this.loadQuizzes();
      this.loadCountries();
    },
    methods: {
      async loadQuizzes() {
        try {
          // En production, charger depuis l'API
          // const response = await this.$axios.get('/api/quizzes');
          // this.availableQuizzes = response.data;
          
          // Pour la démo, utiliser des données fictives
          this.availableQuizzes = [
            {
              id: 1,
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
              id: 2,
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
                'SL': true, 'LR': true, 'CI': true, 'GH': true, 'TG': true,
                'BJ': true, 'NG': true, 'ZW': true, 'ZM': true, 'MW': true,
                'MZ': true, 'MG': true, 'NA': true, 'BW': true, 'ZA': true,
                'LS': true, 'SZ': true, 'AO': true, 'CV': true, 'KM': true,
                'MU': true, 'SC': true, 'ST': true
              }
            },
            {
              id: 3,
              name: 'Les plus grands pays du monde',
              description: 'Pouvez-vous retrouver les 30 plus grands pays par superficie ?',
              difficulty: 2,
              active: true,
              countries: {
                'RU': true, 'CA': true, 'US': true, 'CN': true, 'BR': true,
                'AU': true, 'IN': true, 'AR': true, 'KZ': true, 'DZ': true,
                'CD': true, 'SA': true, 'MX': true, 'ID': true, 'SD': true,
                'LY': true, 'IR': true, 'MN': true, 'PE': true, 'TD': true,
                'NE': true, 'AO': true, 'ML': true, 'ZA': true, 'CO': true,
                'ET': true, 'BO': true, 'MR': true, 'EG': true, 'TZ': true
              }
            }
          ];
        } catch (error) {
          console.error('Erreur lors du chargement des quiz:', error);
          this.showFeedback('Impossible de charger les quiz', 'error');
        }
      },
      
      async loadCountries() {
        try {
          // En production, charger depuis l'API
          // const response = await this.$axios.get('/api/countries');
          // this.countries = response.data;
          
          // Pour la démo, nous utiliserons les pays du composant WorldMap
          // Ici, il faudrait idéalement récupérer les pays depuis un store commun
          // Pour l'exemple, on peut importer un jeu de données minimal
          this.countries = [
            // Copier ici un sous-ensemble de la liste des pays du composant WorldMap
            { id: "FR", code: "FR", name: "France", name_fr: "France", continent: "Europe", discoverable: true },
            { id: "DE", code: "DE", name: "Germany", name_fr: "Allemagne", continent: "Europe", discoverable: true },
            { id: "IT", code: "IT", name: "Italy", name_fr: "Italie", continent: "Europe", discoverable: true },
            { id: "ES", code: "ES", name: "Spain", name_fr: "Espagne", continent: "Europe", discoverable: true },
            { id: "RU", code: "RU", name: "Russia", name_fr: "Russie", continent: "Europe/Asie", discoverable: true },
            { id: "US", code: "US", name: "United States", name_fr: "États-Unis", continent: "Amérique du Nord", discoverable: true },
            { id: "CA", code: "CA", name: "Canada", name_fr: "Canada", continent: "Amérique du Nord", discoverable: true },
            { id: "BR", code: "BR", name: "Brazil", name_fr: "Brésil", continent: "Amérique du Sud", discoverable: true },
            { id: "AR", code: "AR", name: "Argentina", name_fr: "Argentine", continent: "Amérique du Sud", discoverable: true },
            { id: "CN", code: "CN", name: "China", name_fr: "Chine", continent: "Asie", discoverable: true },
            { id: "IN", code: "IN", name: "India", name_fr: "Inde", continent: "Asie", discoverable: true },
            { id: "JP", code: "JP", name: "Japan", name_fr: "Japon", continent: "Asie", discoverable: true },
            { id: "AU", code: "AU", name: "Australia", name_fr: "Australie", continent: "Océanie", discoverable: true },
            { id: "ZA", code: "ZA", name: "South Africa", name_fr: "Afrique du Sud", continent: "Afrique", discoverable: true },
            { id: "NG", code: "NG", name: "Nigeria", name_fr: "Nigeria", continent: "Afrique", discoverable: true },
            { id: "EG", code: "EG", name: "Egypt", name_fr: "Égypte", continent: "Afrique", discoverable: true }
            // ...et ainsi de suite pour tous les pays nécessaires
          ];
          
          // Charger les records utilisateur
          this.loadUserRecords();
        } catch (error) {
          console.error('Erreur lors du chargement des pays:', error);
          this.showFeedback('Impossible de charger les données des pays', 'error');
        }
      },
      
      loadUserRecords() {
        // Simuler le chargement des records depuis le stockage local
        const records = localStorage.getItem('quizRecords');
        if (records) {
          const userRecords = JSON.parse(records);
          // Si un record existe pour le quiz sélectionné, on le récupère
          if (this.selectedQuiz && userRecords[this.selectedQuiz.id]) {
            this.userBestTime = userRecords[this.selectedQuiz.id];
          } else {
            this.userBestTime = null;
          }
        }
      },
      
      selectQuiz(quiz) {
        this.selectedQuiz = quiz;
        
        // Charger le record pour ce quiz
        const records = localStorage.getItem('quizRecords');
        if (records) {
          const userRecords = JSON.parse(records);
          this.userBestTime = userRecords[quiz.id] || null;
        } else {
          this.userBestTime = null;
        }
      },
      
      startGame() {
        // Initialiser le jeu
        this.gameStarted = true;
        this.gamePaused = false;
        this.gameCompleted = false;
        this.showGameOverModal = false;
        this.discoveries = [];
        this.recentDiscoveries = [];
        this.elapsedSeconds = 0;
        this.isNewRecord = false;
        
        // Filtrer les pays pour le quiz
        this.quizCountries = this.countries.filter(country => 
          this.selectedQuiz.countries[country.code]
        );
        
        // Démarrer le timer
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
          this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        }, 1000);
        
        // Focus sur l'input
        this.$nextTick(() => {
          if (this.$refs.countryInput) {
            this.$refs.countryInput.focus();
          }
        });
      },
      
      pauseGame() {
        if (this.gamePaused) return;
        
        this.gamePaused = true;
        clearInterval(this.timerInterval);
        this.pausedTime = this.elapsedSeconds;
      },
      
      resumeGame() {
        if (!this.gamePaused) return;
        
        this.gamePaused = false;
        this.startTime = Date.now() - (this.pausedTime * 1000);
        this.timerInterval = setInterval(() => {
          this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        }, 1000);
        
        // Focus sur l'input
        this.$nextTick(() => {
          if (this.$refs.countryInput) {
            this.$refs.countryInput.focus();
          }
        });
      },
      
      confirmQuit() {
        this.showConfirmModal = true;
      },
      
      stopGame() {
        this.showConfirmModal = true;
      },
      
      confirmStop() {
        // Arrêter le timer
        clearInterval(this.timerInterval);
        
        // Préparer les pays non découverts
        this.undiscoveredCountries = this.quizCountries.filter(country => 
          !this.discoveries.includes(country.code)
        );
        
        // Afficher le modal de fin de jeu
        this.showConfirmModal = false;
        this.gamePaused = false;
        this.showGameOverModal = true;
      },
      
      restartQuiz() {
        this.showGameOverModal = false;
        this.startGame();
      },
      
      changeQuiz() {
        this.showGameOverModal = false;
        this.gameStarted = false;
        this.selectedQuiz = null;
      },
      
      // Formatage du temps
      formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        
        const formattedHours = hours > 0 ? `${hours}:` : '';
        const formattedMinutes = minutes < 10 && hours > 0 ? `0${minutes}` : minutes;
        const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
        
        return `${formattedHours}${formattedMinutes}:${formattedSeconds}`;
      },
      
      // Méthodes liées à la carte SVG
      onSvgLoaded() {
        try {
          console.log("SVG chargé");
          
          // Récupérer le document SVG
          const svgObject = this.$refs.svgObject;
          if (!svgObject || !svgObject.contentDocument) {
            console.error("Impossible d'accéder au document SVG");
            return;
          }
          
          this.svgDocument = svgObject.contentDocument;
          this.svgLoaded = true;
          
          // Initialiser les couleurs des pays
          this.resetCountryColors();
          
          // Ajouter les événements de clic
          this.setupSvgInteractions();
          
        } catch (error) {
          console.error("Erreur lors du chargement de la carte SVG:", error);
        }
      },
      
      resetCountryColors() {
        if (!this.svgDocument) return;
        
        // Réinitialiser tous les pays en gris clair (non disponibles)
        this.countries.forEach(country => {
          const element = this.svgDocument.getElementById(country.code);
          if (element) {
            element.setAttribute('fill', '#e0e0e0');
            element.setAttribute('stroke', '#FFFFFF');
            element.setAttribute('stroke-width', '0.5');
          }
        });
        
        // Colorier les pays du quiz en gris plus foncé
        this.quizCountries.forEach(country => {
            const element = this.svgDocument.getElementById(country.code);
          if (element) {
            element.setAttribute('fill', '#d3d3d3');
            element.setAttribute('stroke', '#FFFFFF');
            element.setAttribute('stroke-width', '0.5');
          }
        });
        
        // Réappliquer les couleurs pour les pays déjà découverts
        this.discoveries.forEach(code => {
          this.updateCountryColor(code, true);
        });
      },
      
      setupSvgInteractions() {
        if (!this.svgDocument) return;
        
        // Ajouter les interactions uniquement pour les pays du quiz
        this.quizCountries.forEach(country => {
          const element = this.svgDocument.getElementById(country.code);
          
          if (element) {
            // Événements de clic et titre
            element.style.cursor = 'pointer';
            element.addEventListener('click', () => {
              if (this.gameStarted && !this.gamePaused) {
                this.handleCountryClick(country);
              }
            });
            
            const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
            title.textContent = country.name_fr || country.name;
            element.appendChild(title);
          }
        });
      },
      
      updateCountryColor(countryCode, discovered) {
        if (!this.svgDocument) return;
        
        const element = this.svgDocument.getElementById(countryCode);
        
        if (element) {
          // Vérifier si le pays fait partie du quiz
          const isQuizCountry = this.quizCountries.some(c => c.code === countryCode);
          
          if (isQuizCountry) {
            element.setAttribute('fill', discovered ? '#4CAF50' : '#d3d3d3');
          } else {
            element.setAttribute('fill', '#e0e0e0');
          }
          
          // Maintenir la bordure
          element.setAttribute('stroke', '#FFFFFF');
          element.setAttribute('stroke-width', '0.5');
        }
      },
      
      handleCountryClick(country) {
        // Si le jeu n'est pas démarré ou est en pause, ne rien faire
        if (!this.gameStarted || this.gamePaused) return;
        
        // Vérifier si le pays a déjà été découvert
        if (this.discoveries.includes(country.code)) {
          this.showFeedback(`Vous avez déjà découvert ${country.name_fr || country.name}.`, 'warning');
          return;
        }
        
        // Si le pays n'a pas été découvert, le marquer comme découvert
        this.discoverCountry(country);
      },
      
      // Vérification du pays entré par l'utilisateur
      checkCountry() {
        // Si le jeu n'est pas démarré ou est en pause, ne rien faire
        if (!this.gameStarted || this.gamePaused) return;
        
        if (!this.countryGuess.trim()) return;
        
        // Normaliser la saisie (minuscules, sans accents, etc.)
        const normalizedGuess = this.normalizeText(this.countryGuess);
        
        // Chercher uniquement parmi les pays du quiz
        const foundCountry = this.quizCountries.find(country => {
          const matchesName = this.normalizeText(country.name) === normalizedGuess;
          const matchesNameFr = this.normalizeText(country.name_fr) === normalizedGuess;
          
          return (matchesName || matchesNameFr) && !this.discoveries.includes(country.code);
        });
        
        if (foundCountry) {
          this.discoverCountry(foundCountry);
        } else {
          // Vérifier si le pays a déjà été découvert
          const alreadyDiscovered = this.quizCountries.find(country => {
            const matchesName = this.normalizeText(country.name) === normalizedGuess;
            const matchesNameFr = this.normalizeText(country.name_fr) === normalizedGuess;
            return (matchesName || matchesNameFr) && this.discoveries.includes(country.code);
          });
          
          // Vérifier si le pays n'est pas dans le quiz
          const notInQuizCountry = this.countries.find(country => {
            const matchesName = this.normalizeText(country.name) === normalizedGuess;
            const matchesNameFr = this.normalizeText(country.name_fr) === normalizedGuess;
            return (matchesName || matchesNameFr) && !this.quizCountries.some(c => c.code === country.code);
          });
          
          if (alreadyDiscovered) {
            this.showFeedback(`Vous avez déjà découvert ${alreadyDiscovered.name_fr || alreadyDiscovered.name}.`, 'warning');
          } else if (notInQuizCountry) {
            this.showFeedback(`${notInQuizCountry.name_fr || notInQuizCountry.name} ne fait pas partie de ce quiz.`, 'info');
          } else {
            this.showFeedback("Ce pays n'existe pas ou le nom est mal orthographié.", 'error');
          }
        }
        
        // Réinitialiser l'input
        this.countryGuess = '';
        if (this.$refs.countryInput) {
          this.$refs.countryInput.focus();
        }
      },
      
      discoverCountry(country) {
        // Vérifier si le pays a déjà été découvert
        if (this.discoveries.includes(country.code)) {
          this.showFeedback(`Vous avez déjà découvert ${country.name_fr || country.name}.`, 'warning');
          return;
        }
        
        // Ajouter le pays aux découvertes
        this.discoveries.push(country.code);
        
        // Mettre à jour la couleur sur la carte
        this.updateCountryColor(country.code, true);
        
        // Ajouter aux découvertes récentes
        this.recentDiscoveries.unshift(country);
        if (this.recentDiscoveries.length > 5) {
          this.recentDiscoveries.pop();
        }
        
        // Afficher un feedback positif
        this.showFeedback(`Bravo ! Vous avez découvert ${country.name_fr || country.name} !`, 'success');
        
        // Vérifier si tous les pays du quiz sont découverts
        if (this.discoveries.length === this.quizCountries.length) {
          this.onGameCompleted();
        }
      },
      
      onGameCompleted() {
        // Arrêter le timer
        clearInterval(this.timerInterval);
        
        // Marquer le quiz comme terminé
        this.gameCompleted = true;
        
        // Vérifier si c'est un nouveau record
        this.checkRecord();
        
        // Sauvegarder le record si nécessaire
        if (this.isNewRecord) {
          this.saveRecord();
        }
        
        // Afficher le modal de fin de jeu
        this.showGameOverModal = true;
      },
      
      checkRecord() {
        // Vérifier si c'est un nouveau record
        if (!this.userBestTime || this.elapsedSeconds < this.userBestTime) {
          this.isNewRecord = true;
          this.userBestTime = this.elapsedSeconds;
        } else {
          this.isNewRecord = false;
        }
      },
      
      saveRecord() {
        // Sauvegarder le record dans le stockage local
        const records = localStorage.getItem('quizRecords');
        let userRecords = records ? JSON.parse(records) : {};
        
        userRecords[this.selectedQuiz.id] = this.elapsedSeconds;
        
        localStorage.setItem('quizRecords', JSON.stringify(userRecords));
      },
      
      // Normalisation de texte pour la comparaison
      normalizeText(text) {
        if (!text) return '';
        return text.normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .toLowerCase()
                  .trim()
                  .replace(/-/g, " ")
                  .replace(/\s+/g, " ");
      },
      
      // Affichage d'un message de feedback
      showFeedback(message, type) {
        this.feedback = message;
        this.feedbackType = type;
        
        clearTimeout(this.feedbackTimeout);
        this.feedbackTimeout = setTimeout(() => {
          this.feedback = '';
        }, 3000);
      },
      
      // Méthodes utilitaires pour les affichages
      getQuizCountriesCount(quiz) {
        return Object.values(quiz.countries).filter(Boolean).length;
      },
      
      getQuizContinentsCount(quiz) {
        const continents = new Set();
        
        this.countries.forEach(country => {
          if (quiz.countries[country.code]) {
            const continentName = country.continent.split('/')[0].trim();
            continents.add(continentName);
          }
        });
        
        return continents.size;
      },
      
      getDifficultyLabel(level) {
        const labels = {
          '1': 'Facile',
          '2': 'Moyen',
          '3': 'Difficile',
          '4': 'Expert'
        };
        return labels[level] || 'Inconnu';
      }
    },
    beforeUnmount() {
      // Nettoyer le timer
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }
    }
  }
</script>

<style lang="scss" scoped>
.quiz-game-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: calc(100vh - 200px);
}

// Sélection du quiz
.quiz-selection {
  text-align: center;
  
  h2 {
    font-size: 2rem;
    color: #333;
    margin-bottom: 1rem;
  }
  
  .intro-text {
    color: #666;
    max-width: 600px;
    margin: 0 auto 2rem;
    font-size: 1.1rem;
  }
  
  .quizzes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 25px;
    margin-top: 30px;
  }
  
  .quiz-card {
    background-color: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }
    
    .quiz-card-header {
      padding: 15px;
      background-color: #f9f9f9;
      display: flex;
      justify-content: flex-end;
      
      .difficulty-badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        
        &.level-1 {
          background-color: #DCEDC8;
          color: #33691E;
        }
        
        &.level-2 {
          background-color: #FFF9C4;
          color: #F57F17;
        }
        
        &.level-3 {
          background-color: #FFCCBC;
          color: #BF360C;
        }
        
        &.level-4 {
          background-color: #FFCDD2;
          color: #B71C1C;
        }
      }
    }
    
    .quiz-card-content {
      padding: 20px;
      
      h3 {
        font-size: 1.3rem;
        color: #333;
        margin-bottom: 10px;
      }
      
      p {
        color: #666;
        margin-bottom: 15px;
        height: 60px; // Pour uniformiser la hauteur
        overflow: hidden;
      }
      
      .quiz-meta {
        color: #888;
        font-size: 0.9rem;
      }
    }
    
    .quiz-card-footer {
      padding: 15px 20px;
      background-color: #f9f9f9;
      border-top: 1px solid #eee;
      
      .btn-play {
        width: 100%;
        padding: 10px;
        border: none;
        background-color: #4CAF50;
        color: white;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.3s ease;
        
        &:hover {
          background-color: #388E3C;
        }
      }
    }
  }
}

// Détails du quiz sélectionné
.quiz-details {
  background-color: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  
  .back-link {
    display: inline-flex;
    align-items: center;
    color: #666;
    margin-bottom: 20px;
    cursor: pointer;
    
    i {
      margin-right: 8px;
    }
    
    &:hover {
      color: #4CAF50;
    }
  }
  
  .quiz-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
    
    h2 {
      font-size: 2rem;
      color: #333;
      margin: 0;
    }
    
    .difficulty-badge {
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
      
      &.level-1 {
        background-color: #DCEDC8;
        color: #33691E;
      }
      
      &.level-2 {
        background-color: #FFF9C4;
        color: #F57F17;
      }
      
      &.level-3 {
        background-color: #FFCCBC;
        color: #BF360C;
      }
      
      &.level-4 {
        background-color: #FFCDD2;
        color: #B71C1C;
      }
    }
  }
  
  .quiz-description {
    color: #666;
    font-size: 1.1rem;
    margin-bottom: 30px;
    line-height: 1.6;
  }
  
  .quiz-stats {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-bottom: 40px;
    
    .stat-item {
      text-align: center;
      
      .stat-value {
        font-size: 2.5rem;
        font-weight: 700;
        color: #4CAF50;
        margin-bottom: 5px;
      }
      
      .stat-label {
        color: #666;
      }
    }
  }
  
  .quiz-actions {
    text-align: center;
    
    .btn-start {
      padding: 12px 30px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s ease;
      
      &:hover {
        background-color: #388E3C;
      }
    }
  }
}

// Styles du jeu
.world-map-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  
  .game-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 20px;
    
    .game-info {
      flex: 1;
      
      h2 {
        font-size: 1.5rem;
        margin-bottom: 10px;
      }
      
      .quiz-progress {
        span {
          display: block;
          margin-bottom: 5px;
        }
        
        .progress-bar {
          width: 100%;
          height: 10px;
          background-color: #e0e0e0;
          border-radius: 5px;
          overflow: hidden;
          
          .progress {
            height: 100%;
            background-color: #4CAF50;
            border-radius: 5px;
            transition: width 0.3s ease;
          }
        }
      }
    }
    
    .game-controls {
      display: flex;
      flex-direction: column;
      gap: 10px;
      
      .timer {
        text-align: right;
        
        .timer-value {
          font-family: monospace;
          background-color: #f5f5f5;
          padding: 5px 10px;
          border-radius: 4px;
          border: 1px solid #ddd;
          font-weight: bold;
        }
      }
      
      .control-buttons {
        display: flex;
        gap: 10px;
        
        .control-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s ease;
          
          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }
        
        .pause-btn {
          background-color: #FFC107;
          color: black;
          
          &:hover:not(:disabled) {
            background-color: #ffb300;
          }
        }
        
        .resume-btn {
          background-color: #4CAF50;
          color: white;
          
          &:hover:not(:disabled) {
            background-color: #388E3C;
          }
        }
        
        .stop-btn {
          background-color: #F44336;
          color: white;
          
          &:hover:not(:disabled) {
            background-color: #D32F2F;
          }
        }
      }
    }
  }
  
  .input-container {
    display: flex;
    margin-bottom: 20px;
    
    &.disabled {
      opacity: 0.7;
    }
    
    input {
      flex: 1;
      padding: 12px;
      font-size: 16px;
      border: 1px solid #ccc;
      border-radius: 4px 0 0 4px;
      
      &:focus {
        outline: none;
        border-color: #4CAF50;
      }
    }
    
    button {
      padding: 12px 20px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 0 4px 4px 0;
      cursor: pointer;
      
      &:hover:not(:disabled) {
        background-color: #388E3C;
      }
      
      &:disabled {
        cursor: not-allowed;
        opacity: 0.7;
      }
    }
  }
  
  .feedback {
    margin-bottom: 20px;
    padding: 10px;
    border-radius: 4px;
    
    .success {
      background-color: #DFF2BF;
      color: #4F8A10;
    }
    
    .warning {
      background-color: #FEEFB3;
      color: #9F6000;
    }
    
    .error {
      background-color: #FFBABA;
      color: #D8000C;
    }
    
    .info {
      background-color: #BDE5F8;
      color: #00529B;
    }
  }
  
  .map-container {
    width: 100%;
    height: 500px;
    border: 1px solid #ccc;
    border-radius: 4px;
    overflow: hidden;
    background-color: #096288;
    margin-bottom: 20px;
    
    .world-map {
      width: 100%;
      height: 100%;
      border: none;
    }
  }
  
  .recently-discovered {
    margin-top: 20px;
    
    h3 {
      font-size: 1.2rem;
      margin-bottom: 10px;
    }
    
    .discoveries-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      
      span {
        background-color: #e8f5e9;
        padding: 5px 10px;
        border-radius: 4px;
        color: #2E7D32;
      }
    }
  }
}

// Modals
.game-over-modal,
.pause-modal,
.confirm-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  
  .modal-content {
    background-color: white;
    border-radius: 8px;
    padding: 30px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    
    h3 {
      font-size: 1.5rem;
      text-align: center;
      margin-bottom: 20px;
      color: #333;
    }
    
    p {
      text-align: center;
      margin-bottom: 20px;
      color: #666;
    }
    
    .game-stats {
      display: flex;
      justify-content: space-between;
      margin: 30px 0;
      
      .stat-item {
        text-align: center;
        flex: 1;
        
        .stat-value {
          font-size: 1.8rem;
          font-weight: 700;
          color: #4CAF50;
        }
        
        .stat-label {
          color: #666;
          font-size: 0.9rem;
        }
      }
    }
    
    .game-over-message {
      text-align: center;
      margin-bottom: 25px;
      
      p {
        margin-bottom: 5px;
      }
    }
    
    .undiscovered-countries {
      margin-bottom: 25px;
      
      h4 {
        font-size: 1.1rem;
        margin-bottom: 10px;
      }
      
      .countries-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        max-height: 150px;
        overflow-y: auto;
        
        span {
          background-color: #f5f5f5;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 0.9rem;
          color: #666;
        }
      }
    }
    
    .modal-actions {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-top: 20px;
      
      button {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        transition: background-color 0.3s ease;
      }
      
      .btn-restart,
      .btn-resume {
        background-color: #4CAF50;
        color: white;
        
        &:hover {
          background-color: #388E3C;
        }
      }
      
      .btn-change-quiz,
      .btn-cancel {
        background-color: #f5f5f5;
        color: #333;
        
        &:hover {
          background-color: #e0e0e0;
        }
      }
      
      .btn-quit,
      .btn-confirm {
        background-color: #F44336;
        color: white;
        
        &:hover {
          background-color: #D32F2F;
        }
      }
    }
  }
}

// Style global pour les éléments SVG
:deep(svg path) {
  transition: fill 0.3s ease;
}

:deep(svg path:hover) {
  stroke-width: 1;
  stroke: #000000;
}

// Responsive adjustments
@media (max-width: 768px) {
  .quiz-game-container {
    padding: 10px;
  }
  
  .game-header {
    flex-direction: column;
    align-items: flex-start;
    
    .game-controls {
      width: 100%;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      
      .timer {
        text-align: left;
      }
    }
  }
  
  .map-container {
    height: 300px;
  }
  
  .game-over-modal,
  .pause-modal,
  .confirm-modal {
    .modal-content {
      padding: 20px;
      
      .game-stats {
        flex-direction: column;
        gap: 15px;
      }
      
      .modal-actions {
        flex-direction: column;
        
        button {
          width: 100%;
        }
      }
    }
  }
}
</style>