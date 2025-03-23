<!-- quiz-map/src/components/auth/RegisterForm.vue -->
<template>
    <div class="register-form">
      <form @submit.prevent="handleRegister">
        <h2>Inscription</h2>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <div class="form-group">
          <label for="username">Nom d'utilisateur</label>
          <input 
            id="username" 
            v-model="username" 
            type="text" 
            required
            placeholder="Choisissez un nom d'utilisateur"
          />
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
            placeholder="Créez un mot de passe sécurisé"
          />
          <div class="password-strength" v-if="password">
            <div 
              class="strength-bar" 
              :style="{ width: `${passwordStrength}%` }"
              :class="strengthClass"
            ></div>
            <small>{{ strengthText }}</small>
          </div>
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">Confirmer le mot de passe</label>
          <input 
            id="confirmPassword" 
            v-model="confirmPassword" 
            type="password" 
            required
            placeholder="Confirmez votre mot de passe"
          />
          <small 
            v-if="passwordMismatch" 
            class="password-mismatch"
          >
            Les mots de passe ne correspondent pas
          </small>
        </div>
        
        <div class="form-group terms">
          <input 
            id="terms" 
            v-model="acceptTerms" 
            type="checkbox" 
            required
          />
          <label for="terms">
            J'accepte les <a href="/terms" target="_blank">conditions d'utilisation</a>
          </label>
        </div>
        
        <button 
          type="submit" 
          class="auth-button" 
          :disabled="loading || !canRegister"
        >
          {{ loading ? 'Inscription en cours...' : 'S\'inscrire' }}
        </button>
        
        <div class="login-link">
          Déjà un compte ? 
          <router-link to="/login">Se connecter</router-link>
        </div>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    name: 'RegisterForm',
    data() {
      return {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
        loading: false,
        error: null
      };
    },
    computed: {
      passwordMismatch() {
        return this.password !== this.confirmPassword && this.confirmPassword.length > 0;
      },
      passwordStrength() {
        const password = this.password;
        if (!password) return 0;
        
        let strength = 0;
        
        // Longueur
        if (password.length >= 8) strength += 25;
        
        // Caractères spéciaux
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 25;
        
        // Chiffres
        if (/\d/.test(password)) strength += 25;
        
        // Majuscules et minuscules
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
        
        return strength;
      },
      strengthClass() {
        if (this.passwordStrength < 50) return 'weak';
        if (this.passwordStrength < 75) return 'medium';
        return 'strong';
      },
      strengthText() {
        if (this.passwordStrength < 50) return 'Faible';
        if (this.passwordStrength < 75) return 'Moyen';
        return 'Fort';
      },
      canRegister() {
        return !this.passwordMismatch && 
               this.acceptTerms && 
               this.username.length > 0 &&
               this.email.length > 0 &&
               this.password.length >= 8;
      }
    },
    methods: {
      async handleRegister() {
        if (!this.canRegister) return;
        
        this.loading = true;
        this.error = null;
        
        try {
          await this.$store.dispatch('register', {
            username: this.username,
            email: this.email,
            password: this.password
          });
          
          // Si l'inscription réussit, passer à la connexion
          this.$emit('registration-success');
          this.$router.push('/login');
        } catch (error) {
          this.error = error.response?.data?.message || 'Erreur lors de l\'inscription';
        } finally {
          this.loading = false;
        }
      }
    }
  };
  </script>
  
  <style lang="scss" scoped>
  .register-form {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    
    form {
      background-color: white;
      border-radius: 8px;
      padding: 30px;
      
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
      
      input[type="text"],
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
      
      &.terms {
        display: flex;
        align-items: flex-start;
        
        input {
          margin-right: 8px;
          margin-top: 4px;
        }
        
        a {
          color: #4CAF50;
          text-decoration: none;
          
          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
    
    .password-strength {
      margin-top: 8px;
      
      .strength-bar {
        height: 5px;
        background-color: #ddd;
        border-radius: 3px;
        margin-bottom: 5px;
        
        &.weak {
          background-color: #F44336;
        }
        
        &.medium {
          background-color: #FFC107;
        }
        
        &.strong {
          background-color: #4CAF50;
        }
      }
    }
    
    .password-mismatch {
      color: #F44336;
      font-size: 12px;
      margin-top: 5px;
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
    
    .login-link {
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