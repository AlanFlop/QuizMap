<template>
  <div id="app">
    <AppHeader />
    <main class="main-content">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';

export default {
  name: 'App',
  components: {
    AppHeader,
    AppFooter
  },
  created() {
    // Vérifier si l'utilisateur est déjà connecté au démarrage
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.$store.commit('setUser', user);
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }
}
</script>

<style lang="scss">
body {
  margin: 0;
  padding: 0;
  font-family: 'Roboto', sans-serif;
  background-color: #f5f7fa;
}

.main-content {
  min-height: calc(100vh - 120px);
  padding: 20px;
}

@media (max-width: 768px) {
  .main-content {
    padding: 10px;
  }
}
</style>