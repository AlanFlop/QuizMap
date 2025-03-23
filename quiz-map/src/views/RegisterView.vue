<template>
    <div class="register-view">
      <AuthComponent :is-login="false" />
    </div>
  </template>
  
  <script>
  import AuthComponent from '@/components/auth/AuthComponent.vue';
  
  export default {
    name: 'RegisterView',
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
  .register-view {
    // Styles spécifiques à la vue d'inscription si nécessaire
  }
  </style>