<template>
  <div class="world-map-container">
    <div class="game-header">
      <h2>Découvrez tous les pays du monde</h2>
      
      <!-- Sélecteur de région -->
      <div class="region-selector">
        <div class="region-label">Choisissez une région:</div>
        <div class="region-buttons">
          <button 
            v-for="region in regions" 
            :key="region.id"
            class="region-btn"
            :class="{ active: selectedRegion === region.id && !selectedQuiz }"
            @click="selectRegion(region.id)"
          >
            {{ region.name }}
          </button>
        </div>
      </div>
      
      <!-- Sélecteur de quiz -->
      <div class="quiz-selector" v-if="availableQuizzes && availableQuizzes.length > 0">
        <h3>Ou choisissez un quiz personnalisé:</h3>
        <div class="quiz-list">
          <button 
            class="quiz-option" 
            :class="{ active: !selectedQuiz }"
            @click="selectQuiz(null)"
          >
            Aucun quiz
          </button>
          
          <button 
            v-for="quiz in availableQuizzes" 
            :key="quiz.id"
            class="quiz-option"
            :class="{ active: selectedQuiz && selectedQuiz.id === quiz.id }"
            @click="selectQuiz(quiz)"
          >
            {{ quiz.name }}
          </button>
        </div>
      </div>
      
      <!-- Barre de progression -->
      <div class="progress-section" v-if="gameStarted">
        <div class="progress-info">
          <span class="progress-text">Progression: {{ discoveredCount }} / {{ totalRegionCountries }} pays</span>
          <span class="progress-percent">{{ Math.round((discoveredCount / totalRegionCountries) * 100) }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress" :style="{ width: (discoveredCount / totalRegionCountries) * 100 + '%' }"></div>
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
            @click="startGame" 
            class="control-btn start-btn" 
            :disabled="gameStarted && !gamePaused"
          >
            {{ gameStarted ? (gamePaused ? 'Reprendre' : 'Redémarrer') : 'Commencer' }}
          </button>
          <button 
            @click="pauseGame" 
            class="control-btn pause-btn"
            :disabled="!gameStarted || gamePaused"
          >
            Pause
          </button>
          <button 
            @click="stopGame" 
            class="control-btn stop-btn"
            :disabled="!gameStarted"
          >
            Arrêter
          </button>
        </div>
      </div>
    </div>

    <div class="input-container" :class="{ 'disabled': !gameStarted || gamePaused }">
      <input 
        v-model="countryGuess" 
        @keyup.enter="checkCountry"
        placeholder="Entrez le nom d'un pays..." 
        ref="countryInput"
        :disabled="!gameStarted || gamePaused"
      />
      <button 
        @click="checkCountry"
        :disabled="!gameStarted || gamePaused"
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
    
    <!-- Bouton pour afficher les pays non découverts (utile pour tester) -->
    <div class="help-section" v-if="gameStarted">
      <button @click="showUndiscoveredCountries" class="help-btn">
        Voir les pays restants
      </button>
    </div>
  </div>
</template>

<script>
// Liste complète des pays avec indication des pays non découvrables
const defaultCountries = [
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
  { id: "RU", code: "RU", name: "Russia", name_fr: "Russie", continent: "Europe", discoverable: true },
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
];

// Définition des dépendances territoriales
const territorialDependencies = {
  "MA": ["EH"], // Le Sahara occidental (EH) est lié au Maroc (MA)
  "DK": ["GL"], // Le Groenland (GL) est lié au Danemark (DK)
  "FR": ["GF"], // La Guyane française (GF) est liée à la France (FR)
  "NO": ["SJ"], // Svalbard (SJ) est lié à la Norvège (NO)
};

export default {
  data() {
    return {
      selectedQuiz: null,
      countryGuess: '',
      countries: defaultCountries,
      discoveries: [],
      recentDiscoveries: [],
      feedback: '',
      feedbackType: '',
      feedbackTimeout: null,
      svgDocument: null,
      svgLoaded: false,
      
      // Données liées au jeu et au timer
      gameStarted: false,
      gamePaused: false,
      elapsedSeconds: 0,
      timerInterval: null,
      startTime: null,
      pausedTime: 0,
      
      // Sélection de région
      selectedRegion: 'world',
      regions: [
        { id: 'world', name: 'Monde entier' },
        { id: 'europe', name: 'Europe' },
        { id: 'asia', name: 'Asie' },
        { id: 'africa', name: 'Afrique' },
        { id: 'north-america', name: 'Amérique du Nord' },
        { id: 'south-america', name: 'Amérique du Sud' },
        { id: 'oceania', name: 'Océanie' }
      ]
    }
  },
  computed: {
    // Récupérer les quiz disponibles depuis le store
    availableQuizzes() {
      // Si le store ne fournit pas correctement les quiz, utiliser une liste de secours
      if (!this.$store.getters['quiz/activeQuizzes'] || 
          !this.$store.getters['quiz/activeQuizzes'].length) {
        console.log('Aucun quiz disponible dans le store, utilisation des quiz de secours');
        return this.getBackupQuizzes();
      }
      return this.$store.getters['quiz/activeQuizzes'];
    },
    
    // Filtrer les pays par région sélectionnée ou par quiz sélectionné
    filteredCountriesByRegion() {
      // Si un quiz est sélectionné, filtrer les pays selon ce quiz
      if (this.selectedQuiz) {
        return this.countries.filter(country => 
          this.selectedQuiz.countries[country.code] && country.discoverable);
      }
      
      // Sinon, filtrer par région
      if (this.selectedRegion === 'world') {
        return this.countries.filter(country => country.discoverable);
      }
      
      // Convertir les ID de régions au format que vous utilisez dans vos données
      const regionMapping = {
        'europe': 'Europe',
        'asia': 'Asie',
        'africa': 'Afrique',
        'north-america': 'Amérique du Nord',
        'south-america': 'Amérique du Sud',
        'oceania': 'Océanie'
      };
      
      const regionName = regionMapping[this.selectedRegion];
      return this.countries.filter(country => 
        country.continent === regionName && country.discoverable
      );
    },
    
    // Nombre total de pays dans la région ou quiz sélectionné
    totalRegionCountries() {
      return this.filteredCountriesByRegion.length;
    },
    
    // Nombre de pays découverts dans la région ou quiz sélectionné
    discoveredCount() {
      return this.discoveries.filter(code => {
        const country = this.countries.find(c => c.code === code);
        return country && country.discoverable && this.filteredCountriesByRegion.some(fc => fc.code === code);
      }).length;
    }
  },
  methods: {
    // Méthode pour obtenir des quiz de secours si le store ne fonctionne pas
    getBackupQuizzes() {
      return [
        {
          id: 'backup1',
          name: 'Pays de l\'Union Européenne',
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
          id: 'backup2',
          name: 'Pays d\'Afrique',
          countries: {
            'MA': true, 'DZ': true, 'TN': true, 'LY': true, 'EG': true,
            'SD': true, 'SS': true, 'ET': true, 'ER': true, 'DJ': true,
            'SO': true, 'KE': true, 'UG': true, 'TZ': true, 'RW': true,
            'BI': true, 'CD': true, 'CG': true, 'GA': true, 'GQ': true,
            'CM': true, 'CF': true, 'TD': true, 'NE': true, 'ML': true
          }
        }
      ];
    },
    
    // Méthode pour sélectionner un quiz
    selectQuiz(quiz) {
      console.log('Quiz sélectionné:', quiz);
      this.selectedQuiz = quiz;
      
      if (quiz) {
        // Si un quiz est sélectionné, configurer le jeu avec les pays du quiz
        this.$store.dispatch('quiz/setActiveQuiz', quiz.id);
      } else {
        // Si "Aucun quiz" est sélectionné, utiliser tous les pays disponibles
        this.$store.dispatch('quiz/setActiveQuiz', null);
      }
      
      // Réinitialiser le jeu si nécessaire
      if (this.gameStarted) {
        this.stopGame();
        this.$nextTick(() => {
          this.startGame();
        });
      } else {
        this.resetCountryColors();
      }
    },
    
    // Méthode pour sélectionner une région
    selectRegion(regionId) {
      console.log('Région sélectionnée:', regionId);
      this.selectedRegion = regionId;
      // Désactiver la sélection de quiz si une région est choisie
      this.selectedQuiz = null;
      
      if (this.gameStarted) {
        this.stopGame();
        this.$nextTick(() => {
          this.startGame();
        });
      } else {
        this.resetCountryColors();
      }
    },
    
    getUndiscoveredCountries() {
      return this.filteredCountriesByRegion
        .filter(country => !this.discoveries.includes(country.code))
        .map(country => country.name_fr || country.name)
        .sort((a, b) => a.localeCompare(b));
    },
    
    // Afficher les pays non découverts
    showUndiscoveredCountries() {
      const undiscoveredCountries = this.getUndiscoveredCountries();
      
      if (undiscoveredCountries.length === 0) {
        this.showFeedback("Vous avez découvert tous les pays !", 'success');
        return;
      }
      
      // Créer un message formatté avec les pays non découverts
      const countriesList = undiscoveredCountries.join(', ');
      const message = `Pays non découverts (${undiscoveredCountries.length}) : ${countriesList}`;
      
      // Afficher dans un modal ou une boîte de dialogue (ici utilisant le système de feedback)
      this.showFeedback(message, 'info', 10000); // Durée plus longue pour lecture
    },
    
    // Contrôles de jeu et timer
    startGame() {
      if (this.gameStarted && !this.gamePaused) {
        // Redémarrer le jeu
        this.stopGame();
        this.$nextTick(() => {
          this.startGame();
        });
        return;
      }
      
      if (!this.gameStarted) {
        // Première fois qu'on démarre
        this.gameStarted = true;
        this.discoveries = [];
        this.recentDiscoveries = [];
        this.elapsedSeconds = 0;
        this.resetCountryColors();
      }
      
      // Si on était en pause, reprendre
      if (this.gamePaused) {
        this.gamePaused = false;
      }
      
      // Démarrer le timer
      const now = Date.now();
      this.startTime = now - (this.pausedTime * 1000);
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
      if (!this.gameStarted || this.gamePaused) return;
      
      this.gamePaused = true;
      this.pausedTime = this.elapsedSeconds;
      
      // Arrêter le timer
      clearInterval(this.timerInterval);
    },
    
    stopGame() {
      this.gameStarted = false;
      this.gamePaused = false;
      
      // Arrêter le timer
      clearInterval(this.timerInterval);
      
      // Afficher un message récapitulatif et les pays non découverts
      const message = `Partie terminée ! Vous avez découvert ${this.discoveredCount} pays sur ${this.totalRegionCountries} en ${this.formatTime(this.elapsedSeconds)}.`;
      this.showFeedback(message, 'info');
      
      // Afficher les pays non découverts
      this.showUndiscoveredCountries();
    },

    formatTime(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      
      const formattedHours = hours > 0 ? `${hours}:` : '';
      const formattedMinutes = minutes < 10 && hours > 0 ? `0${minutes}` : minutes;
      const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
      
      return `${formattedHours}${formattedMinutes}:${formattedSeconds}`;
    },
    
    resetCountryColors() {
      if (!this.svgDocument) return;
      
      // Réinitialiser tous les pays en gris foncé (non disponibles)
      this.countries.forEach(country => {
        const element = this.svgDocument.getElementById(country.code);
        if (element) {
          element.setAttribute('fill', '#e0e0e0'); // Gris clair pour tous les pays
          element.setAttribute('stroke', '#FFFFFF');
          element.setAttribute('stroke-width', '0.5');
        }
      });
      
      // Colorier uniquement les pays de la région sélectionnée
      this.filteredCountriesByRegion.forEach(country => {
        const element = this.svgDocument.getElementById(country.code);
        if (element) {
          element.setAttribute('fill', '#d3d3d3'); // Gris pour les pays de la région
          element.setAttribute('stroke', '#FFFFFF');
          element.setAttribute('stroke-width', '0.5');
        }
      });
      
      // Réappliquer les couleurs pour les pays déjà découverts
      this.discoveries.forEach(code => {
        const country = this.countries.find(c => c.code === code);
        if (country && this.filteredCountriesByRegion.some(fc => fc.code === code)) {
          this.updateCountryColor(code, true);
        }
      });
    },
    
    // Événement déclenché quand le SVG est chargé
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
    
    setupSvgInteractions() {
      if (!this.svgDocument) return;
      
      // Récupérer tous les IDs dans le SVG
      const svgElements = this.svgDocument.querySelectorAll('[id]');
      const svgIds = Array.from(svgElements).map(el => el.id);
      console.log('Tous les IDs dans le SVG:', svgIds);
      
      // Pays qui n'existent PAS dans le SVG
      const missingCountries = this.countries
        .filter(country => !svgIds.includes(country.code))
        .map(country => country.code);
      
      console.log('Pays MANQUANTS dans le SVG:', missingCountries);
      
      // Reste du code inchangé
      this.countries.forEach(country => {
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
      const country = this.countries.find(c => c.code === countryCode);
      
      if (element && country) {
        if (!this.filteredCountriesByRegion.some(c => c.code === countryCode)) {
          // Pays en dehors de la région sélectionnée
          element.setAttribute('fill', '#e0e0e0');
        } else {
          // Pays de la région sélectionnée
          element.setAttribute('fill', discovered ? '#4CAF50' : '#d3d3d3');
        }
        
        // Maintenir la bordure
        element.setAttribute('stroke', '#FFFFFF');
        element.setAttribute('stroke-width', '0.5');
      }
    },
    
    handleCountryClick(country) {
      // Si le jeu n'est pas démarré ou est en pause, ne rien faire
      if (!this.gameStarted || this.gamePaused) return;
      
      // Vérifier si le pays est dans la région sélectionnée
      if (!this.filteredCountriesByRegion.some(c => c.code === country.code)) {
        this.showFeedback(`${country.name_fr || country.name} ne fait pas partie de la région sélectionnée.`, 'info');
        return;
      }
      
      // Vérifiez si le pays existe dans le SVG
      const svgElement = this.svgDocument.getElementById(country.code);
      if (!svgElement) {
        console.warn(`Pays introuvable dans le SVG : ${country.code}`);
        return;
      }
      
      // Le reste du code reste inchangé
      if (!this.discoveries.includes(country.code)) {
        this.discoverCountry(country);
      } else {
        this.showFeedback(`Vous avez déjà découvert ${country.name_fr || country.name}.`, 'warning');
      }
    },
    
    // Vérification du pays entré par l'utilisateur
    checkCountry() {
      // Si le jeu n'est pas démarré ou est en pause, ne rien faire
      if (!this.gameStarted || this.gamePaused) return;
      
      if (!this.countryGuess.trim()) return;
      
      // Normaliser la saisie (minuscules, sans accents, etc.)
      const normalizedGuess = this.normalizeText(this.countryGuess);
      
      // Chercher uniquement parmi les pays de la région sélectionnée
      const foundCountry = this.filteredCountriesByRegion.find(country => {
        const matchesName = this.normalizeText(country.name) === normalizedGuess;
        const matchesNameFr = this.normalizeText(country.name_fr) === normalizedGuess;
        
        return (matchesName || matchesNameFr) && !this.discoveries.includes(country.code);
      });
      
      if (foundCountry) {
        this.discoverCountry(foundCountry);
      } else {
        // Vérifier si le pays a déjà été découvert
        const alreadyDiscovered = this.filteredCountriesByRegion.find(country => {
          const matchesName = this.normalizeText(country.name) === normalizedGuess;
          const matchesNameFr = this.normalizeText(country.name_fr) === normalizedGuess;
          return (matchesName || matchesNameFr) && this.discoveries.includes(country.code);
        });
        
        // Vérifier si le pays est dans une autre région
        const otherRegionCountry = this.countries.find(country => {
          const matchesName = this.normalizeText(country.name) === normalizedGuess;
          const matchesNameFr = this.normalizeText(country.name_fr) === normalizedGuess;
          return (matchesName || matchesNameFr) && !this.filteredCountriesByRegion.some(c => c.code === country.code);
        });
        
        if (alreadyDiscovered) {
          this.showFeedback(`Vous avez déjà découvert ${alreadyDiscovered.name_fr || alreadyDiscovered.name}.`, 'warning');
        } else if (otherRegionCountry) {
          this.showFeedback(`${otherRegionCountry.name_fr || otherRegionCountry.name} ne fait pas partie de la région sélectionnée.`, 'info');
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
      console.log('Découverte du pays :', {
        code: country.code,
        name: country.name_fr,
        discoverable: country.discoverable,
        territoires: territorialDependencies[country.code]
      });

      // Vérifier si le pays est dans la région sélectionnée
      if (!this.filteredCountriesByRegion.some(c => c.code === country.code)) {
        this.showFeedback(`${country.name_fr || country.name} ne fait pas partie de la région sélectionnée.`, 'info');
        return;
      }
      
      // Vérifier si le pays a déjà été découvert
      if (this.discoveries.includes(country.code)) {
        this.showFeedback(`Vous avez déjà découvert ${country.name_fr || country.name}.`, 'warning');
        return;
      }
      
      // Ajouter le pays aux découvertes
      this.discoveries.push(country.code);
      
      // Mettre à jour la couleur sur la carte
      this.updateCountryColor(country.code, true);
      
      // Gestion des territoires dépendants seulement si dans la même région
      if (territorialDependencies[country.code]) {
        territorialDependencies[country.code].forEach(territoryCode => {
          console.log('Traitement du territoire :', territoryCode);
          
          const territory = this.countries.find(c => c.code === territoryCode);
          
          if (territory && !this.discoveries.includes(territoryCode) && 
              this.filteredCountriesByRegion.some(c => c.code === territoryCode)) {
            // Ajouter le territoire aux découvertes seulement s'il est dans la région
            this.discoveries.push(territoryCode);
            
            // Colorer le territoire en vert
            this.updateCountryColor(territoryCode, true);
            
            // Message supplémentaire pour les territoires
            this.showFeedback(`Le territoire ${territory.name_fr || territory.name} est également découvert !`, 'info');
          }
        });
      }
      
      // Vérifier si ce pays est un territoire d'un autre pays
      // Si c'est le cas, découvrir aussi le pays principal (seulement si dans la même région)
      Object.entries(territorialDependencies).forEach(([mainCountryCode, territories]) => {
        if (territories.includes(country.code)) {
          const mainCountry = this.countries.find(c => c.code === mainCountryCode);
          
          if (mainCountry && !this.discoveries.includes(mainCountryCode) && 
              this.filteredCountriesByRegion.some(c => c.code === mainCountryCode)) {
            // Ajouter le pays principal aux découvertes
            this.discoveries.push(mainCountryCode);
            
            // Colorer le pays principal en vert
            this.updateCountryColor(mainCountryCode, true);
            
            // Message supplémentaire pour le pays principal
            this.showFeedback(`${mainCountry.name_fr || mainCountry.name} est également découvert !`, 'info');
          }
        }
      });
      
      // Ajouter aux découvertes récentes
      this.recentDiscoveries.unshift(country);
      if (this.recentDiscoveries.length > 5) {
        this.recentDiscoveries.pop();
      }
      
      // Sauvegarder la progression localement
      localStorage.setItem('worldMapDiscoveries', JSON.stringify(this.discoveries));
      
      // Afficher un feedback positif
      this.showFeedback(`Bravo ! Vous avez découvert ${country.name_fr || country.name} !`, 'success');
      
      // Vérifier si tous les pays découvrables de la région sont découverts
      if (this.discoveredCount === this.totalRegionCountries) {
        this.gameCompleted();
      }
    },
    
    // Jeu terminé (tous les pays découverts)
    gameCompleted() {
      // Arrêter le timer
      clearInterval(this.timerInterval);
      
      // Mettre à jour l'état du jeu
      this.gameStarted = false;
      
      // Afficher un message de félicitations
      const regionName = this.selectedQuiz ? 
        this.selectedQuiz.name : 
        this.regions.find(r => r.id === this.selectedRegion).name;
        
      const message = `Félicitations ! Vous avez découvert tous les pays de "${regionName}" en ${this.formatTime(this.elapsedSeconds)} !`;
      this.showFeedback(message, 'success');
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
    showFeedback(message, type, duration = 3000) {
      this.feedback = message;
      this.feedbackType = type;
      
      clearTimeout(this.feedbackTimeout);
      this.feedbackTimeout = setTimeout(() => {
        this.feedback = '';
      }, duration);
    },
    
    // Méthode utilitaire pour obtenir le nom d'une difficulté
    getDifficultyLabel(level) {
      const labels = {
        '1': 'Facile',
        '2': 'Moyen',
        '3': 'Difficile',
        '4': 'Expert'
      };
      return labels[level] || 'Inconnu';
    },
    
    // Méthode utilitaire pour obtenir le nombre de pays dans un quiz
    getQuizCountriesCount(quiz) {
      if (!quiz || !quiz.countries) return 0;
      return Object.values(quiz.countries).filter(Boolean).length;
    },
    
    // Afficher des logs pour le débogage
    logState() {
      console.log('État actuel:');
      console.log('- Région sélectionnée:', this.selectedRegion);
      console.log('- Quiz sélectionné:', this.selectedQuiz ? this.selectedQuiz.name : 'Aucun');
      console.log('- Pays filtrés:', this.filteredCountriesByRegion.length);
      console.log('- Pays découverts:', this.discoveredCount);
    }
  },
  mounted() {
    console.log("Composant WorldMap monté");
    
    // Charger les quiz disponibles au chargement du composant
    this.$store.dispatch('quiz/fetchQuizzes').then(() => {
      console.log('Quiz chargés:', this.$store.getters['quiz/activeQuizzes']);
      this.logState();
    }).catch(error => {
      console.error('Erreur lors du chargement des quiz:', error);
    });
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
.world-map-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.game-header {
  margin-bottom: 20px;
}

/* Styles pour le sélecteur de région */
.region-selector {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.region-label {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.region-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
}

.region-btn {
  padding: 8px 16px;
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #e0e0e0;
  }
  
  &.active {
    background-color: #4CAF50;
    color: white;
    border-color: #4CAF50;
  }
}

.quiz-selector {
  margin-bottom: 20px;
}

.quiz-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
  justify-content: center;
}

.quiz-option {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.quiz-option:hover {
  background-color: #f5f5f5;
}

.quiz-option.active {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.progress-section {
  margin-bottom: 20px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  margin-top: 10px;
  margin-bottom: 20px;
}

.progress {
  height: 100%;
  background-color: #4CAF50;
  border-radius: 5px;
  transition: width 0.3s ease;
}

/* Styles pour le timer et les contrôles de jeu */
.game-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.timer {
  font-size: 1.2rem;
  font-weight: bold;
}

.timer-label {
  margin-right: 8px;
}

.timer-value {
  font-family: monospace;
  background-color: #f5f5f5;
  padding: 5px 10px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.control-buttons {
  display: flex;
  gap: 10px;
}

.control-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.start-btn {
  background-color: #4CAF50;
  color: white;
}

.start-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.pause-btn {
  background-color: #FFC107;
  color: black;
}

.pause-btn:hover:not(:disabled) {
  background-color: #ffb300;
}

.stop-btn {
  background-color: #F44336;
  color: white;
}

.stop-btn:hover:not(:disabled) {
  background-color: #e53935;
}

.input-container {
  display: flex;
  margin-bottom: 20px;
}

.input-container.disabled {
  opacity: 0.7;
}

.input-container input {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px 0 0 4px;
}

.input-container button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.input-container button:hover:not(:disabled) {
  background-color: #388E3C;
}

.input-container button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.feedback {
  margin-bottom: 20px;
  padding: 10px;
  border-radius: 4px;
}

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

.map-container {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
  height: 650px; /* Augmenté de 500px à 600px */
  background-color: #096288;
  position: relative; /* Ajouté pour le positionnement du SVG */
}

.world-map {
  width: 100%;
  height: 100%;
  border: none;
  position: relative; /* Permettre le positionnement du contenu SVG */
  transform: scale(0.95) translateX(5%); /* Réduire légèrement et décaler vers la droite */
}

:deep(svg) {
  overflow: visible;
}

.recently-discovered {
  margin-top: 20px;
}

.discoveries-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.discoveries-list span {
  background-color: #e8f5e9;
  padding: 5px 10px;
  border-radius: 4px;
  color: #2E7D32;
}

.help-section {
  margin-top: 20px;
  text-align: center;
}

.help-btn {
  padding: 8px 16px;
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.help-btn:hover {
  background-color: #e0e0e0;
}

/* Style global appliqué à travers le composant onSvgLoaded */
:deep(svg path) {
  transition: fill 0.3s ease;
}

:deep(svg path:hover) {
  stroke-width: 1;
  stroke: #000000;
  cursor: pointer;
}

@media (max-width: 768px) {
  .map-container {
    height: 300px;
  }
  
  .game-controls {
    flex-direction: column;
    gap: 15px;
  }
  
  .timer {
    align-self: flex-start;
  }
  
  .region-buttons {
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 300px;
    margin: 0 auto 15px;
  }
  
  .region-btn {
    width: 100%;
  }
  
  .quiz-list {
    flex-direction: column;
    width: 100%;
  }
  
  .quiz-option {
    width: 100%;
    text-align: center;
  }
}
</style>
  