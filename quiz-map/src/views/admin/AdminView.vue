<template>
  <div class="admin-view">
    <div class="admin-header">
      <h1>Administration</h1>
      <p class="admin-description">Zone d'administration pour gérer le contenu de l'application</p>
    </div>
    
    <div class="admin-tabs">
      <div 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['tab', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        <i :class="tab.icon"></i>
        {{ tab.name }}
      </div>
    </div>
    
    <div class="admin-content">
      <!-- Ajouter un indicateur simple pour vérifier si cette partie est rendue -->
      <p>Tab active: {{ activeTab }}</p>
      
      <!-- Gestion des quiz -->
      <admin-quiz-component v-if="activeTab === 'quiz'" />
      
      <!-- Autres onglets d'administration à ajouter au besoin -->
      <div v-else-if="activeTab === 'users'" class="placeholder">
        <p>Gestion des utilisateurs - Fonctionnalité à venir</p>
      </div>
      
      <div v-else-if="activeTab === 'stats'" class="placeholder">
        <p>Statistiques - Fonctionnalité à venir</p>
      </div>
      
      <div v-else-if="activeTab === 'settings'" class="placeholder">
        <p>Paramètres - Fonctionnalité à venir</p>
      </div>
    </div>
  </div>
</template>

<script>
// Import explicite avec le chemin complet pour s'assurer qu'il trouve le composant
import AdminQuizComponent from '@/components/admin/AdminQuizComponent.vue'

export default {
  name: 'AdminView',
  components: {
    AdminQuizComponent
  },
  data() {
    return {
      activeTab: 'quiz',
      tabs: [
        { id: 'quiz', name: 'Quiz', icon: 'fas fa-question-circle' },
        { id: 'users', name: 'Utilisateurs', icon: 'fas fa-users' },
        { id: 'stats', name: 'Statistiques', icon: 'fas fa-chart-bar' },
        { id: 'settings', name: 'Paramètres', icon: 'fas fa-cog' }
      ]
    }
  },
  mounted() {
    console.log('AdminView montée avec succès');
    console.log('Tab active:', this.activeTab);
    console.log('Composants enregistrés:', this.$options.components);
  }
}
</script>

<style lang="scss" scoped>
.admin-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

.admin-header {
  margin-bottom: 30px;
  
  h1 {
    font-size: 2.5rem;
    color: #333;
    margin-bottom: 10px;
  }
  
  .admin-description {
    color: #666;
    font-size: 1.1rem;
  }
}

.admin-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 30px;
  
  .tab {
    padding: 15px 25px;
    font-weight: 600;
    color: #666;
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: center;
    
    i {
      margin-right: 10px;
      font-size: 1.2rem;
    }
    
    &:hover {
      color: #4CAF50;
    }
    
    &.active {
      color: #4CAF50;
      
      &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        width: 100%;
        height: 3px;
        background-color: #4CAF50;
      }
    }
  }
}

.admin-content {
  min-height: 500px;
  
  .placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400px;
    background-color: #f9f9f9;
    border-radius: 8px;
    
    p {
      color: #888;
      font-size: 1.2rem;
    }
  }
}

@media (max-width: 768px) {
  .admin-header {
    h1 {
      font-size: 2rem;
    }
  }
  
  .admin-tabs {
    overflow-x: auto;
    margin: 0 -20px 30px;
    padding: 0 20px;
    
    &::-webkit-scrollbar {
      display: none;
    }
    
    .tab {
      padding: 15px 15px;
      white-space: nowrap;
      
      i {
        margin-right: 5px;
      }
    }
  }
}
</style>