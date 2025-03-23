<template>
    <div class="login-view">
      <AuthComponent />
    </div>
  </template>
  
  <script>
  import AuthComponent from '@/components/auth/AuthComponent.vue';
  
  export default {
    name: 'LoginView',
    components: {
      AuthComponent
    },
    created() {
      // Rediriger si déjà connecté
      if (this.$store.getters.isAuthenticated) {
        this.$router.push('/');
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .login-view {
    // Styles spécifiques à la vue de connexion si nécessaire
  }
  </style>