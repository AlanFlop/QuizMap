<template>
    <div class="create-quiz-view">
      <h1>Créer un nouveau quiz</h1>
      <!-- Utilisez votre composant AdminQuizComponent ici -->
      <admin-quiz-component />
    </div>
  </template>
  
  <script>
  import AdminQuizComponent from '@/components/admin/AdminQuizComponent.vue'
  
  export default {
    name: 'CreateQuizView',
    components: {
      AdminQuizComponent
    }
  }
  </script>
  
  <style scoped>
  .create-quiz-view {
    padding: 20px;
  }
  </style>