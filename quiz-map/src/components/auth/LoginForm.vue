<!-- quiz-map/src/components/auth/LoginForm.vue -->
<template>
    <div class="login-form">
      <form @submit.prevent="handleLogin">
        <h2>Connexion</h2>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            id="email" 
            v-model="email" 
            type="email" 
            required
            placeholder="votre@email.com"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input 
            id="password" 
            v-model="password" 
            type="password" 
            required
            placeholder="Votre mot de passe"
          />
          <small class="forgot-password" @click="forgotPassword">
            Mot de passe oublié ?
          </small>
        </div>
        
        <div class="form-group remember-me">
          <input 
            id="remember-me" 
            v-model="rememberMe" 
            type="checkbox"
          />
          <label for="remember-me">Se souvenir de moi</label>
        </div>
        
        <button type="submit" class="auth-button" :disabled="loading">
          {{ loading ? 'Connexion en cours...' : 'Se connecter' }}
        </button>
        
        <div class="register-link">
          Pas encore de compte ? 
          <router-link to="/register">S'inscrire</router-link>
        </div>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    name: 'LoginForm',
    data() {
      return {
        email: '',
        password: '',
        rememberMe: false,
        loading: false,
        error: null
      };
    },
    methods: {
      async handleLogin() {
        this.loading = true;
        this.error = null;
        
        try {
          await this.$store.dispatch('login', {
            email: this.email,
            password: this.password,
            rememberMe: this.rememberMe
          });
          
          // Redirection après connexion réussie
          const redirectPath = this.$route.query.redirect || '/';
          this.$router.push(redirectPath);
        } catch (error) {
          this.error = error.response?.data?.message || 'Erreur lors de la connexion';
        } finally {
          this.loading = false;
        }
      },
      forgotPassword() {
        this.$router.push('/reset-password');
      }
    }
  };
  </script>
  
  <style lang="scss" scoped>
  .login-form {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    
    form {
      background-color: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      
      h2 {
        text-align: center;
        margin-bottom: 20px;
        color: #333;
      }
    }
    
    .error-message {
      background-color: #FFEBEE;
      color: #D32F2F;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 20px;
      font-size: 14px;
    }
    
    .form-group {
      margin-bottom: 20px;
      
      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #555;
      }
      
      input[type="email"],
      input[type="password"] {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
        
        &:focus {
          outline: none;
          border-color: #4CAF50;
        }
      }
      
      &.remember-me {
        display: flex;
        align-items: center;
        
        input {
          margin-right: 8px;
        }
      }
      
      .forgot-password {
        display: block;
        text-align: right;
        color: #4CAF50;
        margin-top: 8px;
        cursor: pointer;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
    
    .auth-button {
      width: 100%;
      background-color: #4CAF50;
      color: white;
      border: none;
      padding: 12px;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.3s;
      
      &:hover {
        background-color: #45a049;
      }
      
      &:disabled {
        background-color: #9E9E9E;
        cursor: not-allowed;
      }
    }
    
    .register-link {
      text-align: center;
      margin-top: 20px;
      color: #666;
      
      a {
        color: #4CAF50;
        text-decoration: none;
        font-weight: 500;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
  </style>