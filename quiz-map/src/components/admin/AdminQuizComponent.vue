<template>
  <div class="admin-quiz-container">
    <!-- Message de succès -->
    <div class="success-message" v-if="successMessage">
      <div class="success-content">
        <i class="fas fa-check-circle"></i>
        <span>{{ successMessage }}</span>
      </div>
    </div>

    <!-- En-tête avec titre et bouton de création -->
    <div class="admin-header">
      <h2>Gestion des Quiz</h2>
      <button class="btn-create" @click="showCreateForm = true" v-if="!showCreateForm">
        <i class="fas fa-plus-circle"></i> Créer un nouveau quiz
      </button>
    </div>
    
    <!-- Formulaire de création/édition de quiz -->
    <div class="quiz-form" v-if="showCreateForm">
      <h3>{{ editMode ? 'Modifier le quiz' : 'Créer un nouveau quiz' }}</h3>
      
      <div class="form-group">
        <label for="quiz-name">Nom du quiz</label>
        <input 
          type="text" 
          id="quiz-name" 
          v-model="quizForm.name" 
          placeholder="Nom du quiz"
        />
      </div>
      
      <div class="form-group">
        <label for="quiz-description">Description</label>
        <textarea 
          id="quiz-description" 
          v-model="quizForm.description" 
          placeholder="Description du quiz"
          rows="3"
        ></textarea>
      </div>
      
      <div class="form-group">
        <label for="quiz-difficulty">Difficulté</label>
        <select id="quiz-difficulty" v-model="quizForm.difficulty">
          <option value="1">Facile</option>
          <option value="2">Moyen</option>
          <option value="3">Difficile</option>
          <option value="4">Expert</option>
        </select>
      </div>
      
      <div class="form-group quiz-active">
        <label class="switch">
          <input type="checkbox" v-model="quizForm.active">
          <span class="slider round"></span>
        </label>
        <label for="quiz-active">Quiz actif</label>
      </div>
      
      <div class="countries-selection">
        <h4>Sélection des pays</h4>
        
        <div class="countries-list">
          <div 
            v-for="continent in continents" 
            :key="continent.id" 
            class="continent-section"
          >
            <div class="continent-header" @click="continent.expanded = !continent.expanded">
              <h5>
                <i :class="['fas', continent.expanded ? 'fa-chevron-down' : 'fa-chevron-right']"></i>
                {{ continent.name }}
              </h5>
              
              <div class="continent-actions">
                <label class="switch continent-switch">
                  <input 
                    type="checkbox" 
                    :checked="continent.selected"
                    @change="toggleContinent(continent)"
                  >
                  <span class="slider round"></span>
                </label>
                <div class="btn-group">
                  <button 
                    class="btn-sm" 
                    @click.stop="selectAllCountriesInContinent(continent.id, true)"
                  >
                    Tout sélectionner
                  </button>
                  <button 
                    class="btn-sm" 
                    @click.stop="selectAllCountriesInContinent(continent.id, false)"
                  >
                    Tout désélectionner
                  </button>
                </div>
              </div>
            </div>
            
            <div class="countries-grid" v-show="continent.expanded">
              <div 
                v-for="country in getCountriesByContinent(continent.id)" 
                :key="country.code" 
                class="country-checkbox"
              >
                <label class="switch">
                  <input 
                    type="checkbox" 
                    v-model="quizForm.countries[country.code]"
                    @change="updateContinentSelection"
                  >
                  <span class="slider round"></span>
                </label>
                <label>{{ country.name_fr }}</label>
              </div>
            </div>
          </div>
        </div>
        
        <div class="selected-summary">
          <h4>Résumé des pays sélectionnés: {{ getSelectedCountriesCount('all') }} pays</h4>
          <ul class="continents-summary">
            <li v-for="continent in continents" :key="continent.id">
              {{ continent.name }}: {{ getSelectedCountriesCount(continent.id) }} pays
            </li>
          </ul>
        </div>
      </div>
      
      <div class="form-actions">
        <button class="btn-cancel" @click="cancelForm">Annuler</button>
        <button 
          class="btn-save" 
          @click="saveQuiz" 
          :disabled="!isFormValid"
        >
          {{ editMode ? 'Mettre à jour' : 'Créer' }}
        </button>
      </div>
    </div>
    
    <!-- Liste des quiz existants -->
    <div class="quiz-list" v-if="!showCreateForm">
      <div class="list-header">
        <h3>Quiz disponibles</h3>
        <input 
          type="text" 
          class="search-input" 
          placeholder="Rechercher un quiz..." 
          v-model="searchQuery"
        />
      </div>
      
      <div class="quiz-table">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Description</th>
              <th>Difficulté</th>
              <th>Statut</th>
              <th>Pays</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredQuizzes.length === 0">
              <td colspan="6" class="no-data">Aucun quiz disponible</td>
            </tr>
            <tr v-for="quiz in filteredQuizzes" :key="quiz.id">
              <td>{{ quiz.name }}</td>
              <td>{{ quiz.description }}</td>
              <td>
                <span :class="['difficulty-badge', 'level-' + quiz.difficulty]">
                  {{ getDifficultyLabel(quiz.difficulty) }}
                </span>
              </td>
              <td>
                <span :class="['status-badge', quiz.active ? 'active' : 'inactive']">
                  {{ quiz.active ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td>{{ getQuizCountriesCount(quiz) }} pays</td>
              <td>
                <div class="action-buttons">
                  <button class="btn-edit" @click="editQuiz(quiz)" title="Modifier">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-duplicate" @click="duplicateQuiz(quiz)" title="Dupliquer">
                    <i class="fas fa-copy"></i>
                  </button>
                  <button class="btn-delete" @click="confirmDeleteQuiz(quiz)" title="Supprimer">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Modal de confirmation de suppression -->
    <div class="delete-modal" v-if="showDeleteModal">
      <div class="modal-content">
        <h4>Confirmer la suppression</h4>
        <p>
          Êtes-vous sûr de vouloir supprimer le quiz <strong>{{ quizToDelete?.name }}</strong> ?
        </p>
        <p class="warning">Cette action est irréversible.</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showDeleteModal = false">Annuler</button>
          <button class="btn-confirm-delete" @click="deleteQuiz">Confirmer</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'AdminQuizComponent',
  data() {
    return {
      quizzes: [],
      showCreateForm: false,
      editMode: false,
      editId: null,
      searchQuery: '',
      quizForm: {
        name: '',
        description: '',
        difficulty: '2',
        active: true,
        countries: {}
      },
      continents: [
        { id: 'europe', name: 'Europe', selected: false, expanded: true },
        { id: 'asia', name: 'Asie', selected: false, expanded: false },
        { id: 'africa', name: 'Afrique', selected: false, expanded: false },
        { id: 'north-america', name: 'Amérique du Nord', selected: false, expanded: false },
        { id: 'south-america', name: 'Amérique du Sud', selected: false, expanded: false },
        { id: 'oceania', name: 'Océanie', selected: false, expanded: false }
      ],
      countries: [], // Sera chargé depuis le store ou API
      showDeleteModal: false,
      quizToDelete: null,
      successMessage: '',
      successTimeout: null
    }
  },
  computed: {
    filteredQuizzes() {
      if (!this.searchQuery) return this.quizzes;
      
      const query = this.searchQuery.toLowerCase();
      return this.quizzes.filter(quiz => 
        quiz.name.toLowerCase().includes(query) || 
        quiz.description.toLowerCase().includes(query)
      );
    },
    isFormValid() {
      // Vérifier si le formulaire a des valeurs valides
      return this.quizForm.name.trim() !== '' && 
             this.getSelectedCountriesCount('all') > 0;
    }
  },
  mounted() {
    console.log('AdminQuizComponent - mounted');
    this.loadQuizzes();
    this.loadCountries();
  },
  methods: {
    async loadQuizzes() {
      console.log('Chargement des quiz...');
      try {
        // Charger les quiz depuis le store Vuex
        await this.$store.dispatch('quiz/fetchQuizzes');
        this.quizzes = this.$store.getters['quiz/allQuizzes'];
        
        // Si aucun quiz n'est chargé, utiliser les données de démo
        if (!this.quizzes || this.quizzes.length === 0) {
          this.quizzes = [
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
            }
          ];
          
          // Sauvegarder les données de démo dans le store
          for (const quiz of this.quizzes) {
            await this.$store.dispatch('quiz/saveQuiz', quiz);
          }
        }
        
        console.log('Quiz chargés avec succès');
      } catch (error) {
        console.error('Erreur lors du chargement des quiz:', error);
        console.log('Impossible de charger les quiz');
      }
    },
    
    async loadCountries() {
      console.log('Chargement des pays...');
      try {
        // Pour la démo, nous utiliserons une liste plus complète de pays
        this.countries = [
        { id: "SR", code: "SR", name: "Suriname", name_fr: "Suriname", continent: "Amérique du Sud", discoverable: true },
  { id: "TW", code: "TW", name: "Taiwan", name_fr: "Taïwan", continent: "Asie", discoverable: true },
  { id: "XK", code: "XK", name: "Kosovo", name_fr: "Kosovo", continent: "Europe", discoverable: true },
  { id: "DO", code: "DO", name: "Dominican Republic", name_fr: "République dominicaine", continent: "Amérique du Nord", discoverable: true },
  { id: "MA", code: "MA", name: "Morocco", name_fr: "Maroc", continent: "Afrique", discoverable: true },
  { id: "EH", code: "EH", name: "Western Sahara", name_fr: "Sahara occidental", continent: "Afrique", discoverable: true },
  { id: "SJ", code: "SJ", name: "Svalbard", name_fr: "Svalbard", continent: "Europe", discoverable: true },
  { id: "GL", code: "GL", name: "Greenland", name_fr: "Groenland", continent: "Europe", discoverable: true },
  { id: "DK", code: "DK", name: "Denmark", name_fr: "Danemark", continent: "Europe", discoverable: true },
  { id: "GF", code: "GF", name: "French Guiana", name_fr: "Guyane française", continent: "Europe", discoverable: true },
  { id: "AF", code: "AF", name: "Afghanistan", name_fr: "Afghanistan", continent: "Asie", discoverable: true },
  { id: "ZA", code: "ZA", name: "South Africa", name_fr: "Afrique du Sud", continent: "Afrique", discoverable: true },
  { id: "AL", code: "AL", name: "Albania", name_fr: "Albanie", continent: "Europe", discoverable: true },
  { id: "DZ", code: "DZ", name: "Algeria", name_fr: "Algérie", continent: "Afrique", discoverable: true },
  { id: "DE", code: "DE", name: "Germany", name_fr: "Allemagne", continent: "Europe", discoverable: true },
  { id: "AD", code: "AD", name: "Andorra", name_fr: "Andorre", continent: "Europe", discoverable: true },
  { id: "AO", code: "AO", name: "Angola", name_fr: "Angola", continent: "Afrique", discoverable: true },
  { id: "AG", code: "AG", name: "Antigua and Barbuda", name_fr: "Antigua-et-Barbuda", continent: "Amérique du Nord", discoverable: true },
  { id: "SA", code: "SA", name: "Saudi Arabia", name_fr: "Arabie Saoudite", continent: "Asie", discoverable: true },
  { id: "AR", code: "AR", name: "Argentina", name_fr: "Argentine", continent: "Amérique du Sud", discoverable: true },
  { id: "AM", code: "AM", name: "Armenia", name_fr: "Arménie", continent: "Asie", discoverable: true },
  { id: "AU", code: "AU", name: "Australia", name_fr: "Australie", continent: "Océanie", discoverable: true },
  { id: "AT", code: "AT", name: "Austria", name_fr: "Autriche", continent: "Europe", discoverable: true },
  { id: "AZ", code: "AZ", name: "Azerbaijan", name_fr: "Azerbaïdjan", continent: "Asie", discoverable: true },
  { id: "BS", code: "BS", name: "Bahamas", name_fr: "Bahamas", continent: "Amérique du Nord", discoverable: true },
  { id: "BH", code: "BH", name: "Bahrain", name_fr: "Bahreïn", continent: "Asie", discoverable: true },
  { id: "BD", code: "BD", name: "Bangladesh", name_fr: "Bangladesh", continent: "Asie", discoverable: true },
  { id: "BB", code: "BB", name: "Barbados", name_fr: "Barbade", continent: "Amérique du Nord", discoverable: true },
  { id: "BE", code: "BE", name: "Belgium", name_fr: "Belgique", continent: "Europe", discoverable: true },
  { id: "BZ", code: "BZ", name: "Belize", name_fr: "Belize", continent: "Amérique du Nord", discoverable: true },
  { id: "BJ", code: "BJ", name: "Benin", name_fr: "Bénin", continent: "Afrique", discoverable: true },
  { id: "BT", code: "BT", name: "Bhutan", name_fr: "Bhoutan", continent: "Asie", discoverable: true },
  { id: "BY", code: "BY", name: "Belarus", name_fr: "Biélorussie", continent: "Europe", discoverable: true },
  { id: "MM", code: "MM", name: "Myanmar", name_fr: "Birmanie", continent: "Asie", discoverable: true },
  { id: "BO", code: "BO", name: "Bolivia", name_fr: "Bolivie", continent: "Amérique du Sud", discoverable: true },
  { id: "BA", code: "BA", name: "Bosnia and Herzegovina", name_fr: "Bosnie-Herzégovine", continent: "Europe", discoverable: true },
  { id: "BW", code: "BW", name: "Botswana", name_fr: "Botswana", continent: "Afrique", discoverable: true },
  { id: "BR", code: "BR", name: "Brazil", name_fr: "Brésil", continent: "Amérique du Sud", discoverable: true },
  { id: "BN", code: "BN", name: "Brunei", name_fr: "Brunei", continent: "Asie", discoverable: true },
  { id: "BG", code: "BG", name: "Bulgaria", name_fr: "Bulgarie", continent: "Europe", discoverable: true },
  { id: "BF", code: "BF", name: "Burkina Faso", name_fr: "Burkina Faso", continent: "Afrique", discoverable: true },
  { id: "BI", code: "BI", name: "Burundi", name_fr: "Burundi", continent: "Afrique", discoverable: true },
  { id: "KH", code: "KH", name: "Cambodia", name_fr: "Cambodge", continent: "Asie", discoverable: true },
  { id: "CM", code: "CM", name: "Cameroon", name_fr: "Cameroun", continent: "Afrique", discoverable: true },
  { id: "CA", code: "CA", name: "Canada", name_fr: "Canada", continent: "Amérique du Nord", discoverable: true },
  { id: "CV", code: "CV", name: "Cape Verde", name_fr: "Cap-Vert", continent: "Afrique", discoverable: true },
  { id: "CF", code: "CF", name: "Central African Republic", name_fr: "République centrafricaine", continent: "Afrique", discoverable: true },
  { id: "CL", code: "CL", name: "Chile", name_fr: "Chili", continent: "Amérique du Sud", discoverable: true },
  { id: "CN", code: "CN", name: "China", name_fr: "Chine", continent: "Asie", discoverable: true },
  { id: "CY", code: "CY", name: "Cyprus", name_fr: "Chypre", continent: "Europe", discoverable: true },
  { id: "CO", code: "CO", name: "Colombia", name_fr: "Colombie", continent: "Amérique du Sud", discoverable: true },
  { id: "KM", code: "KM", name: "Comoros", name_fr: "Comores", continent: "Afrique", discoverable: true },
  { id: "CG", code: "CG", name: "Republic of the Congo", name_fr: "République du Congo", continent: "Afrique", discoverable: true },
  { id: "CD", code: "CD", name: "Democratic Republic of the Congo", name_fr: "République démocratique du Congo", continent: "Afrique", discoverable: true },
  { id: "KP", code: "KP", name: "North Korea", name_fr: "Corée du Nord", continent: "Asie", discoverable: true },
  { id: "KR", code: "KR", name: "South Korea", name_fr: "Corée du Sud", continent: "Asie", discoverable: true },
  { id: "CR", code: "CR", name: "Costa Rica", name_fr: "Costa Rica", continent: "Amérique du Nord", discoverable: true },
  { id: "CI", code: "CI", name: "Ivory Coast", name_fr: "Côte d'Ivoire", continent: "Afrique", discoverable: true },
  { id: "HR", code: "HR", name: "Croatia", name_fr: "Croatie", continent: "Europe", discoverable: true },
  { id: "CU", code: "CU", name: "Cuba", name_fr: "Cuba", continent: "Amérique du Nord", discoverable: true },
  { id: "DJ", code: "DJ", name: "Djibouti", name_fr: "Djibouti", continent: "Afrique", discoverable: true },
  { id: "DM", code: "DM", name: "Dominica", name_fr: "Dominique", continent: "Amérique du Nord", discoverable: true },
  { id: "EG", code: "EG", name: "Egypt", name_fr: "Égypte", continent: "Afrique", discoverable: true },
  { id: "AE", code: "AE", name: "United Arab Emirates", name_fr: "Émirats arabes unis", continent: "Asie", discoverable: true },
  { id: "EC", code: "EC", name: "Ecuador", name_fr: "Équateur", continent: "Amérique du Sud", discoverable: true },
  { id: "ER", code: "ER", name: "Eritrea", name_fr: "Érythrée", continent: "Afrique", discoverable: true },
  { id: "ES", code: "ES", name: "Spain", name_fr: "Espagne", continent: "Europe", discoverable: true },
  { id: "EE", code: "EE", name: "Estonia", name_fr: "Estonie", continent: "Europe", discoverable: true },
  { id: "SZ", code: "SZ", name: "Eswatini", name_fr: "Eswatini", continent: "Afrique", discoverable: true },
  { id: "US", code: "US", name: "United States", name_fr: "États-Unis", continent: "Amérique du Nord", discoverable: true },
  { id: "ET", code: "ET", name: "Ethiopia", name_fr: "Éthiopie", continent: "Afrique", discoverable: true },
  { id: "FJ", code: "FJ", name: "Fiji", name_fr: "Fidji", continent: "Océanie", discoverable: true },
  { id: "FI", code: "FI", name: "Finland", name_fr: "Finlande", continent: "Europe", discoverable: true },
  { id: "FR", code: "FR", name: "France", name_fr: "France", continent: "Europe", discoverable: true },
  { id: "GA", code: "GA", name: "Gabon", name_fr: "Gabon", continent: "Afrique", discoverable: true },
  { id: "GM", code: "GM", name: "Gambia", name_fr: "Gambie", continent: "Afrique", discoverable: true },
  { id: "GE", code: "GE", name: "Georgia", name_fr: "Géorgie", continent: "Asie", discoverable: true },
  { id: "GH", code: "GH", name: "Ghana", name_fr: "Ghana", continent: "Afrique", discoverable: true },
  { id: "GR", code: "GR", name: "Greece", name_fr: "Grèce", continent: "Europe", discoverable: true },
  { id: "GD", code: "GD", name: "Grenada", name_fr: "Grenade", continent: "Amérique du Nord", discoverable: true },
  { id: "GT", code: "GT", name: "Guatemala", name_fr: "Guatemala", continent: "Amérique du Nord", discoverable: true },
  { id: "GN", code: "GN", name: "Guinea", name_fr: "Guinée", continent: "Afrique", discoverable: true },
  { id: "GQ", code: "GQ", name: "Equatorial Guinea", name_fr: "Guinée équatoriale", continent: "Afrique", discoverable: true },
  { id: "GW", code: "GW", name: "Guinea-Bissau", name_fr: "Guinée-Bissau", continent: "Afrique", discoverable: true },
  { id: "GY", code: "GY", name: "Guyana", name_fr: "Guyana", continent: "Amérique du Sud", discoverable: true },
  { id: "HT", code: "HT", name: "Haiti", name_fr: "Haïti", continent: "Amérique du Nord", discoverable: true },
  { id: "HN", code: "HN", name: "Honduras", name_fr: "Honduras", continent: "Amérique du Nord", discoverable: true },
  { id: "HU", code: "HU", name: "Hungary", name_fr: "Hongrie", continent: "Europe", discoverable: true },
  { id: "IN", code: "IN", name: "India", name_fr: "Inde", continent: "Asie", discoverable: true },
  { id: "ID", code: "ID", name: "Indonesia", name_fr: "Indonésie", continent: "Asie", discoverable: true },
  { id: "IQ", code: "IQ", name: "Iraq", name_fr: "Irak", continent: "Asie", discoverable: true },
  { id: "IR", code: "IR", name: "Iran", name_fr: "Iran", continent: "Asie", discoverable: true },
  { id: "IE", code: "IE", name: "Ireland", name_fr: "Irlande", continent: "Europe", discoverable: true },
  { id: "IS", code: "IS", name: "Iceland", name_fr: "Islande", continent: "Europe", discoverable: true },
  { id: "IL", code: "IL", name: "Israel", name_fr: "Palestine", continent: "Asie", discoverable: true },
  { id: "IT", code: "IT", name: "Italy", name_fr: "Italie", continent: "Europe", discoverable: true },
  { id: "JM", code: "JM", name: "Jamaica", name_fr: "Jamaïque", continent: "Amérique du Nord", discoverable: true },
  { id: "JP", code: "JP", name: "Japan", name_fr: "Japon", continent: "Asie", discoverable: true },
  { id: "JO", code: "JO", name: "Jordan", name_fr: "Jordanie", continent: "Asie", discoverable: true },
  { id: "KZ", code: "KZ", name: "Kazakhstan", name_fr: "Kazakhstan", continent: "Asie", discoverable: true },
  { id: "KE", code: "KE", name: "Kenya", name_fr: "Kenya", continent: "Afrique", discoverable: true },
  { id: "KG", code: "KG", name: "Kyrgyzstan", name_fr: "Kirghizistan", continent: "Asie", discoverable: true },
  { id: "KI", code: "KI", name: "Kiribati", name_fr: "Kiribati", continent: "Océanie", discoverable: true },
  { id: "KW", code: "KW", name: "Kuwait", name_fr: "Koweït", continent: "Asie", discoverable: true },
  { id: "LA", code: "LA", name: "Laos", name_fr: "Laos", continent: "Asie", discoverable: true },
  { id: "LS", code: "LS", name: "Lesotho", name_fr: "Lesotho", continent: "Afrique", discoverable: true },
  { id: "LV", code: "LV", name: "Latvia", name_fr: "Lettonie", continent: "Europe", discoverable: true },
  { id: "LB", code: "LB", name: "Lebanon", name_fr: "Liban", continent: "Asie", discoverable: true },
  { id: "LR", code: "LR", name: "Liberia", name_fr: "Liberia", continent: "Afrique", discoverable: true },
  { id: "LY", code: "LY", name: "Libya", name_fr: "Libye", continent: "Afrique", discoverable: true },
  { id: "LI", code: "LI", name: "Liechtenstein", name_fr: "Liechtenstein", continent: "Europe", discoverable: true },
  { id: "LT", code: "LT", name: "Lithuania", name_fr: "Lituanie", continent: "Europe", discoverable: true },
  { id: "LU", code: "LU", name: "Luxembourg", name_fr: "Luxembourg", continent: "Europe", discoverable: true },
  { id: "MK", code: "MK", name: "North Macedonia", name_fr: "Macédoine du Nord", continent: "Europe", discoverable: true },
  { id: "MG", code: "MG", name: "Madagascar", name_fr: "Madagascar", continent: "Afrique", discoverable: true },
  { id: "MY", code: "MY", name: "Malaysia", name_fr: "Malaisie", continent: "Asie", discoverable: true },
  { id: "MW", code: "MW", name: "Malawi", name_fr: "Malawi", continent: "Afrique", discoverable: true },
  { id: "MV", code: "MV", name: "Maldives", name_fr: "Maldives", continent: "Asie", discoverable: true },
  { id: "ML", code: "ML", name: "Mali", name_fr: "Mali", continent: "Afrique", discoverable: true },
  { id: "MT", code: "MT", name: "Malta", name_fr: "Malte", continent: "Europe", discoverable: true },
  { id: "MH", code: "MH", name: "Marshall Islands", name_fr: "Îles Marshall", continent: "Océanie", discoverable: true },
  { id: "MU", code: "MU", name: "Mauritius", name_fr: "Maurice", continent: "Afrique", discoverable: true },
  { id: "MR", code: "MR", name: "Mauritania", name_fr: "Mauritanie", continent: "Afrique", discoverable: true },
  { id: "MX", code: "MX", name: "Mexico", name_fr: "Mexique", continent: "Amérique du Nord", discoverable: true },
  { id: "FM", code: "FM", name: "Micronesia", name_fr: "Micronésie", continent: "Océanie", discoverable: true },
  { id: "MD", code: "MD", name: "Moldova", name_fr: "Moldavie", continent: "Europe", discoverable: true },
  { id: "MC", code: "MC", name: "Monaco", name_fr: "Monaco", continent: "Europe", discoverable: true },
  { id: "MN", code: "MN", name: "Mongolia", name_fr: "Mongolie", continent: "Asie", discoverable: true },
  { id: "ME", code: "ME", name: "Montenegro", name_fr: "Monténégro", continent: "Europe", discoverable: true },
  { id: "MZ", code: "MZ", name: "Mozambique", name_fr: "Mozambique", continent: "Afrique", discoverable: true },
  { id: "NA", code: "NA", name: "Namibia", name_fr: "Namibie", continent: "Afrique", discoverable: true },
  { id: "NR", code: "NR", name: "Nauru", name_fr: "Nauru", continent: "Océanie", discoverable: true },
  { id: "NP", code: "NP", name: "Nepal", name_fr: "Népal", continent: "Asie", discoverable: true },
  { id: "NI", code: "NI", name: "Nicaragua", name_fr: "Nicaragua", continent: "Amérique du Nord", discoverable: true },
  { id: "NE", code: "NE", name: "Niger", name_fr: "Niger", continent: "Afrique", discoverable: true },
  { id: "NG", code: "NG", name: "Nigeria", name_fr: "Nigeria", continent: "Afrique", discoverable: true },
  { id: "NO", code: "NO", name: "Norway", name_fr: "Norvège", continent: "Europe", discoverable: true },
  { id: "NZ", code: "NZ", name: "New Zealand", name_fr: "Nouvelle-Zélande", continent: "Océanie", discoverable: true },
  { id: "OM", code: "OM", name: "Oman", name_fr: "Oman", continent: "Asie", discoverable: true },
  { id: "UG", code: "UG", name: "Uganda", name_fr: "Ouganda", continent: "Afrique", discoverable: true },
  { id: "UZ", code: "UZ", name: "Uzbekistan", name_fr: "Ouzbékistan", continent: "Asie", discoverable: true },
  { id: "PK", code: "PK", name: "Pakistan", name_fr: "Pakistan", continent: "Asie", discoverable: true },
  { id: "PW", code: "PW", name: "Palau", name_fr: "Palaos", continent: "Océanie", discoverable: true },
  { id: "PS", code: "PS", name: "Palestine", name_fr: "Palestine", continent: "Asie", discoverable: true },
  { id: "PA", code: "PA", name: "Panama", name_fr: "Panama", continent: "Amérique du Nord", discoverable: true },
  { id: "PG", code: "PG", name: "Papua New Guinea", name_fr: "Papouasie-Nouvelle-Guinée", continent: "Océanie", discoverable: true },
  { id: "PY", code: "PY", name: "Paraguay", name_fr: "Paraguay", continent: "Amérique du Sud", discoverable: true },
  { id: "NL", code: "NL", name: "Netherlands", name_fr: "Pays-Bas", continent: "Europe", discoverable: true },
  { id: "PE", code: "PE", name: "Peru", name_fr: "Pérou", continent: "Amérique du Sud", discoverable: true },
  { id: "PH", code: "PH", name: "Philippines", name_fr: "Philippines", continent: "Asie", discoverable: true },
  { id: "PL", code: "PL", name: "Poland", name_fr: "Pologne", continent: "Europe", discoverable: true },
  { id: "PT", code: "PT", name: "Portugal", name_fr: "Portugal", continent: "Europe", discoverable: true },
  { id: "QA", code: "QA", name: "Qatar", name_fr: "Qatar", continent: "Asie", discoverable: true },
  { id: "RO", code: "RO", name: "Romania", name_fr: "Roumanie", continent: "Europe", discoverable: true },
  { id: "GB", code: "GB", name: "United Kingdom", name_fr: "Royaume-Uni", continent: "Europe", discoverable: true },
  { id: "RU", code: "RU", name: "Russia", name_fr: "Russie", continent: "Europe/Asie", discoverable: true },
  { id: "RW", code: "RW", name: "Rwanda", name_fr: "Rwanda", continent: "Afrique", discoverable: true },
  { id: "KN", code: "KN", name: "Saint Kitts and Nevis", name_fr: "Saint-Christophe", continent: "Amérique du Nord", discoverable: true },
  { id: "SM", code: "SM", name: "San Marino", name_fr: "Saint-Marin", continent: "Europe", discoverable: true },
  { id: "VC", code: "VC", name: "Saint Vincent and the Grenadines", name_fr: "Saint-Vincent", continent: "Amérique du Nord", discoverable: true },
  { id: "LC", code: "LC", name: "Saint Lucia", name_fr: "Sainte-Lucie", continent: "Amérique du Nord", discoverable: true },
  { id: "SB", code: "SB", name: "Solomon Islands", name_fr: "Salomon", continent: "Océanie", discoverable: true },
  { id: "SV", code: "SV", name: "El Salvador", name_fr: "Salvador", continent: "Amérique du Nord", discoverable: true },
  { id: "WS", code: "WS", name: "Samoa", name_fr: "Samoa", continent: "Océanie", discoverable: true },
  { id: "ST", code: "ST", name: "Sao Tome and Principe", name_fr: "Sao Tomé-et-Principe", continent: "Afrique", discoverable: true },
  { id: "SN", code: "SN", name: "Senegal", name_fr: "Sénégal", continent: "Afrique", discoverable: true },
  { id: "RS", code: "RS", name: "Serbia", name_fr: "Serbie", continent: "Europe", discoverable: true },
  { id: "SC", code: "SC", name: "Seychelles", name_fr: "Seychelles", continent: "Afrique", discoverable: true },
  { id: "SL", code: "SL", name: "Sierra Leone", name_fr: "Sierra Leone", continent: "Afrique", discoverable: true },
  { id: "SG", code: "SG", name: "Singapore", name_fr: "Singapour", continent: "Asie", discoverable: true },
  { id: "SK", code: "SK", name: "Slovakia", name_fr: "Slovaquie", continent: "Europe", discoverable: true },
  { id: "SI", code: "SI", name: "Slovenia", name_fr: "Slovénie", continent: "Europe", discoverable: true },
  { id: "SO", code: "SO", name: "Somalia", name_fr: "Somalie", continent: "Afrique", discoverable: true },
  { id: "SD", code: "SD", name: "Sudan", name_fr: "Soudan", continent: "Afrique", discoverable: true },
  { id: "SS", code: "SS", name: "South Sudan", name_fr: "Soudan du Sud", continent: "Afrique", discoverable: true },
  { id: "LK", code: "LK", name: "Sri Lanka", name_fr: "Sri Lanka", continent: "Asie", discoverable: true },
  { id: "SE", code: "SE", name: "Sweden", name_fr: "Suède", continent: "Europe", discoverable: true },
  { id: "CH", code: "CH", name: "Switzerland", name_fr: "Suisse", continent: "Europe", discoverable: true },
  { id: "SR", code: "SR", name: "Suriname", name_fr: "Suriname", continent: "Amérique du Sud", discoverable: true },
  { id: "SY", code: "SY", name: "Syria", name_fr: "Syrie", continent: "Asie", discoverable: true },
  { id: "TJ", code: "TJ", name: "Tajikistan", name_fr: "Tadjikistan", continent: "Asie", discoverable: true },
  { id: "TZ", code: "TZ", name: "Tanzania", name_fr: "Tanzanie", continent: "Afrique", discoverable: true },
  { id: "TD", code: "TD", name: "Chad", name_fr: "Tchad", continent: "Afrique", discoverable: true },
  { id: "CZ", code: "CZ", name: "Czech Republic", name_fr: "République tchèque", continent: "Europe", discoverable: true },
  { id: "TH", code: "TH", name: "Thailand", name_fr: "Thaïlande", continent: "Asie", discoverable: true },
  { id: "TL", code: "TL", name: "East Timor", name_fr: "Timor oriental", continent: "Asie", discoverable: true },
  { id: "TG", code: "TG", name: "Togo", name_fr: "Togo", continent: "Afrique", discoverable: true },
  { id: "TO", code: "TO", name: "Tonga", name_fr: "Tonga", continent: "Océanie", discoverable: true },
  { id: "TT", code: "TT", name: "Trinidad and Tobago", name_fr: "Trinité", continent: "Amérique du Nord", discoverable: true },
  { id: "TN", code: "TN", name: "Tunisia", name_fr: "Tunisie", continent: "Afrique", discoverable: true },
  { id: "TM", code: "TM", name: "Turkmenistan", name_fr: "Turkménistan", continent: "Asie", discoverable: true },
  { id: "TR", code: "TR", name: "Turkey", name_fr: "Turquie", continent: "Europe/Asie", discoverable: true },
  { id: "TV", code: "TV", name: "Tuvalu", name_fr: "Tuvalu", continent: "Océanie", discoverable: true },
  { id: "UA", code: "UA", name: "Ukraine", name_fr: "Ukraine", continent: "Europe", discoverable: true },
  { id: "UY", code: "UY", name: "Uruguay", name_fr: "Uruguay", continent: "Amérique du Sud", discoverable: true },
  { id: "VU", code: "VU", name: "Vanuatu", name_fr: "Vanuatu", continent: "Océanie", discoverable: true },
  { id: "VA", code: "VA", name: "Vatican City", name_fr: "Vatican", continent: "Europe", discoverable: true },
  { id: "VE", code: "VE", name: "Venezuela", name_fr: "Venezuela", continent: "Amérique du Sud", discoverable: true },
  { id: "VN", code: "VN", name: "Vietnam", name_fr: "Vietnam", continent: "Asie", discoverable: true },
  { id: "YE", code: "YE", name: "Yemen", name_fr: "Yémen", continent: "Asie", discoverable: true },
  { id: "ZM", code: "ZM", name: "Zambia", name_fr: "Zambie", continent: "Afrique", discoverable: true },
  { id: "ZW", code: "ZW", name: "Zimbabwe", name_fr: "Zimbabwe", continent: "Afrique", discoverable: true }
      ]
        
        // Initialiser le tableau de pays du formulaire
        this.countries.forEach(country => {
          this.quizForm.countries[country.code] = false;
        });
        
        console.log('Pays chargés avec succès');
      } catch (error) {
        console.error('Erreur lors du chargement des pays:', error);
        console.log('Impossible de charger la liste des pays');
      }
    },
    
    getCountriesByContinent(continentId) {
      return this.countries.filter(country => 
        country.continent === this.getContinentName(continentId)
      );
    },
    
    getContinentName(continentId) {
      // Mapping des ID de continents aux noms utilisés dans les données de pays
      const continentMapping = {
        'europe': 'Europe',
        'asia': 'Asie',
        'africa': 'Afrique',
        'north-america': 'Amérique du Nord',
        'south-america': 'Amérique du Sud',
        'oceania': 'Océanie'
      };
      
      return continentMapping[continentId] || continentId;
    },
    
    getSelectedCountriesCount(continentId) {
      if (continentId === 'all') {
        return Object.values(this.quizForm.countries).filter(Boolean).length;
      }
      
      const continentCountries = this.getCountriesByContinent(continentId);
      return continentCountries.filter(country => 
        this.quizForm.countries[country.code]
      ).length;
    },
    
    getQuizCountriesCount(quiz) {
      return Object.values(quiz.countries).filter(Boolean).length;
    },
    
    toggleContinent(continent) {
      console.log('toggleContinent appelé pour', continent.id);
      
      // Inverser l'état de sélection du continent
      continent.selected = !continent.selected;
      
      const continentCountries = this.getCountriesByContinent(continent.id);
      
      // Marquer tous les pays du continent comme sélectionnés ou non
      continentCountries.forEach(country => {
        this.quizForm.countries[country.code] = continent.selected;
      });
      
      // Toujours développer/réduire le continent quand on clique dessus
      continent.expanded = !continent.expanded;
    },
    
    selectAllCountriesInContinent(continentId, selected) {
      console.log('selectAllCountriesInContinent appelé pour', continentId, selected);
      const continentCountries = this.getCountriesByContinent(continentId);
      
      continentCountries.forEach(country => {
        this.quizForm.countries[country.code] = selected;
      });
      
      this.updateContinentSelection();
    },
    
    updateContinentSelection() {
      // Mettre à jour l'état de sélection des continents
      this.continents.forEach(continent => {
        const continentCountries = this.getCountriesByContinent(continent.id);
        const selectedCount = continentCountries.filter(country => 
          this.quizForm.countries[country.code]
        ).length;
        
        continent.selected = selectedCount === continentCountries.length && continentCountries.length > 0;
      });
    },
    
    getDifficultyLabel(level) {
      const labels = {
        '1': 'Facile',
        '2': 'Moyen',
        '3': 'Difficile',
        '4': 'Expert'
      };
      return labels[level] || 'Inconnu';
    },
    
    editQuiz(quiz) {
      console.log('editQuiz appelé pour', quiz.id);
      this.editMode = true;
      this.editId = quiz.id;
      
      // Copier les données du quiz dans le formulaire
      this.quizForm.name = quiz.name;
      this.quizForm.description = quiz.description;
      this.quizForm.difficulty = quiz.difficulty.toString();
      this.quizForm.active = quiz.active;
      
      // Réinitialiser la sélection des pays
      this.countries.forEach(country => {
        this.quizForm.countries[country.code] = !!quiz.countries[country.code];
      });
      
      this.updateContinentSelection();
      this.showCreateForm = true;
    },
    
    duplicateQuiz(quiz) {
      console.log('duplicateQuiz appelé pour', quiz.id);
      this.editMode = false;
      
      // Copier les données du quiz dans le formulaire
      this.quizForm.name = `${quiz.name} (copie)`;
      this.quizForm.description = quiz.description;
      this.quizForm.difficulty = quiz.difficulty.toString();
      this.quizForm.active = quiz.active;
      
      // Copier la sélection des pays
      this.countries.forEach(country => {
        this.quizForm.countries[country.code] = !!quiz.countries[country.code];
      });
      
      this.updateContinentSelection();
      this.showCreateForm = true;
    },
    
    confirmDeleteQuiz(quiz) {
      console.log('confirmDeleteQuiz appelé pour', quiz.id);
      this.quizToDelete = quiz;
      this.showDeleteModal = true;
    },
    
    async deleteQuiz() {
      console.log('deleteQuiz appelé');
      if (!this.quizToDelete) return;
      
      try {
        // Supprimer via le store Vuex
        await this.$store.dispatch('quiz/deleteQuiz', this.quizToDelete.id);
        
        // Rafraîchir la liste
        this.quizzes = this.$store.getters['quiz/allQuizzes'];
        
        console.log('Quiz supprimé avec succès');
        this.showSuccessMessage('Quiz supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression du quiz:', error);
        console.log('Impossible de supprimer le quiz');
      } finally {
        this.showDeleteModal = false;
        this.quizToDelete = null;
      }
    },
    
    async saveQuiz() {
      console.log('saveQuiz appelé');
      try {
        const quizData = {
          name: this.quizForm.name,
          description: this.quizForm.description,
          difficulty: parseInt(this.quizForm.difficulty),
          active: this.quizForm.active,
          countries: { ...this.quizForm.countries }
        };
        
        if (this.editMode) {
          quizData.id = this.editId;
        }
        
        // Sauvegarder via le store Vuex
        await this.$store.dispatch('quiz/saveQuiz', quizData);
        
        // Rafraîchir la liste
        this.quizzes = this.$store.getters['quiz/allQuizzes'];
        
        const message = this.editMode ? 'Quiz mis à jour avec succès' : 'Quiz créé avec succès';
        console.log(message);
        
        // Afficher un message de succès
        this.showSuccessMessage(message);
        
        this.cancelForm();
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du quiz:', error);
        console.log('Impossible de sauvegarder le quiz');
      }
    },
    
    showSuccessMessage(message) {
      this.successMessage = message;
      
      if (this.successTimeout) {
        clearTimeout(this.successTimeout);
      }
      
      this.successTimeout = setTimeout(() => {
        this.successMessage = '';
      }, 5000); // Le message disparaît après 5 secondes
    },
    
    cancelForm() {
      console.log('cancelForm appelé');
      this.showCreateForm = false;
      this.editMode = false;
      this.editId = null;
      
      // Réinitialiser le formulaire
      this.quizForm = {
        name: '',
        description: '',
        difficulty: '2',
        active: true,
        countries: {}
      };
      
      // Réinitialiser la sélection des pays
      this.countries.forEach(country => {
        this.quizForm.countries[country.code] = false;
      });
      
      // Réinitialiser la sélection des continents
      this.continents.forEach(continent => {
        continent.selected = false;
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.admin-quiz-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
  position: relative;
}

/* Style pour le message de succès */
.success-message {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  animation: fadeInOut 5s forwards;
  
  .success-content {
    background-color: #4CAF50;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    
    i {
      margin-right: 10px;
      font-size: 1.2rem;
    }
  }
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  
  h2 {
    font-size: 1.8rem;
    font-weight: 700;
    color: #333;
  }
  
  .btn-create {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    
    i {
      margin-right: 8px;
    }
    
    &:hover {
      background-color: #45a049;
    }
  }
}

.quiz-form {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
  }
  
  .form-group {
    margin-bottom: 20px;
    
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
    }
    
    input[type="text"],
    textarea,
    select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      
      &:focus {
        outline: none;
        border-color: #4CAF50;
        box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
      }
    }
    
    &.quiz-active {
      display: flex;
      align-items: center;
      
      label:not(.switch) {
        margin-left: 10px;
        margin-bottom: 0;
      }
    }
  }
  
  .countries-selection {
    margin-top: 30px;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 20px;
    background-color: white;
    
    h4 {
      margin-bottom: 15px;
      font-size: 1.2rem;
    }
  }
  
  .countries-list {
    max-height: 600px;
    overflow-y: auto;
    border: 1px solid #eee;
    border-radius: 4px;
    
    .continent-section {
      border-bottom: 1px solid #eee;
      
      &:last-child {
        border-bottom: none;
      }
      
      .continent-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        background-color: #f5f5f5;
        cursor: pointer;
        
        &:hover {
          background-color: #efefef;
        }
        
        h5 {
          display: flex;
          align-items: center;
          font-size: 1.1rem;
          margin: 0;
          
          i {
            margin-right: 10px;
            width: 14px;
            text-align: center;
          }
        }
        
        .continent-actions {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .btn-group {
          display: flex;
          gap: 5px;
        }
        
        .btn-sm {
          background-color: transparent;
          border: 1px solid #ddd;
          padding: 5px 10px;
          border-radius: 3px;
          font-size: 0.8rem;
          cursor: pointer;
          
          &:hover {
            background-color: #e0e0e0;
          }
        }
      }
      
      .countries-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 15px;
        padding: 15px;
        background-color: white;
        
        .country-checkbox {
          display: flex;
          align-items: center;
          
          label:not(.switch) {
            margin-left: 10px;
            font-weight: normal;
          }
        }
      }
    }
  }
  
  .selected-summary {
    margin-top: 25px;
    padding: 15px;
    background-color: #f5f5f5;
    border-radius: 4px;
    
    h4 {
      margin-bottom: 10px;
      font-size: 1.1rem;
    }
    
    .continents-summary {
      list-style: none;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 10px;
      
      li {
        font-size: 0.9rem;
      }
    }
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 30px;
    
    button {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
    }
    
    .btn-cancel {
      background-color: #f5f5f5;
      color: #333;
      
      &:hover {
        background-color: #e0e0e0;
      }
    }
    
    .btn-save {
      background-color: #4CAF50;
      color: white;
      
      &:hover {
        background-color: #45a049;
      }
      
      &:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
      }
    }
  }
}

.quiz-list {
  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h3 {
      font-size: 1.5rem;
    }
    
    .search-input {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      width: 250px;
      
      &:focus {
        outline: none;
        border-color: #4CAF50;
      }
    }
  }
  
  .quiz-table {
    width: 100%;
    overflow-x: auto;
    
    table {
      width: 100%;
      border-collapse: collapse;
      
      th, td {
        padding: 12px 15px;
        text-align: left;
        border-bottom: 1px solid #eee;
      }
      
      th {
        background-color: #f5f5f5;
        font-weight: 600;
      }
      
      tr:hover td {
        background-color: #f9f9f9;
      }
      
      .difficulty-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 3px;
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
      
      .status-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 3px;
        font-size: 0.8rem;
        font-weight: 600;
        
        &.active {
          background-color: #E8F5E9;
          color: #2E7D32;
        }
        
        &.inactive {
          background-color: #ECEFF1;
          color: #546E7A;
        }
      }
      
      .action-buttons {
        display: flex;
        gap: 8px;
        
        button {
          width: 30px;
          height: 30px;
          border: none;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          
          i {
            font-size: 0.9rem;
          }
        }
        
        .btn-edit {
          background-color: #E3F2FD;
          color: #1565C0;
          
          &:hover {
            background-color: #BBDEFB;
          }
        }
        
        .btn-duplicate {
          background-color: #E8F5E9;
          color: #2E7D32;
          
          &:hover {
            background-color: #C8E6C9;
          }
        }
        
        .btn-delete {
          background-color: #FFEBEE;
          color: #C62828;
          
          &:hover {
            background-color: #FFCDD2;
          }
        }
      }
      
      .no-data {
        text-align: center;
        padding: 30px;
        color: #757575;
      }
    }
  }
}

.delete-modal {
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
    padding: 25px;
    max-width: 450px;
    width: 100%;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    
    h4 {
      font-size: 1.3rem;
      margin-bottom: 15px;
      color: #333;
    }
    
    p {
      margin-bottom: 20px;
      line-height: 1.5;
    }
    
    .warning {
      color: #C62828;
      font-weight: 500;
    }
    
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 15px;
      
      button {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
      }
      
      .btn-cancel {
        background-color: #f5f5f5;
        color: #333;
        
        &:hover {
          background-color: #e0e0e0;
        }
      }
      
      .btn-confirm-delete {
        background-color: #F44336;
        color: white;
        
        &:hover {
          background-color: #D32F2F;
        }
      }
    }
  }
}

/* Style pour les switches (toggle buttons) */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  margin: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #4CAF50;
}

input:focus + .slider {
  box-shadow: 0 0 1px #4CAF50;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

/* Style arrondi */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

/* Style pour le switch du continent */
.continent-switch {
  margin-right: 10px;
}

@media (max-width: 768px) {
  .countries-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
  }
  
  .continent-header {
    flex-direction: column;
    align-items: flex-start !important;
    
    .continent-actions {
      margin-top: 10px;
      width: 100%;
      justify-content: space-between;
    }
  }
  
  .search-input {
    width: 100% !important;
    max-width: 250px;
  }
}
</style>