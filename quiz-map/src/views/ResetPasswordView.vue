<template>
    <div class="reset-password-view">
      <div class="reset-card">
        <div class="reset-header">
          <h2>{{ step === 'request' ? 'Réinitialisation du mot de passe' : 'Nouveau mot de passe' }}</h2>
          <p class="reset-description">
            {{ 
              step === 'request' 
                ? 'Entrez votre adresse email ci-dessous. Nous vous enverrons un lien pour réinitialiser votre mot de passe.' 
                : 'Veuillez entrer votre nouveau mot de passe ci-dessous.'
            }}
          </p>
        </div>
  
        <div v-if="errorMessage" class="reset-error">
          {{ errorMessage }}
        </div>
  
        <div v-if="successMessage" class="reset-success">
          {{ successMessage }}
        </div>
  
<!-- Étape 1: Demande de réinitialisation -->
<form v-if="step === 'request'" @submit.prevent="requestReset" class="reset-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            id="email" 
            v-model="requestForm.email" 
            type="email" 
            required
            placeholder="Entrez votre adresse email"
          />
        </div>

        <button type="submit" class="reset-button" :disabled="isLoading">
          {{ isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation' }}
        </button>

        <div class="form-footer">
          <router-link to="/login">Retour à la connexion</router-link>
        </div>
      </form>

      <!-- Étape 2: Définir un nouveau mot de passe -->
      <form v-else-if="step === 'reset'" @submit.prevent="resetPassword" class="reset-form">
        <div class="form-group">
          <label for="new-password">Nouveau mot de passe</label>
          <input 
            id="new-password" 
            v-model="resetForm.password" 
            type="password" 
            required
            placeholder="Entrez votre nouveau mot de passe"
          />
          <div class="password-strength" v-if="resetForm.password">
            <div 
              class="strength-bar" 
              :style="{ width: `${passwordStrength}%` }"
              :class="strengthClass"
            ></div>
            <small>{{ strengthText }}</small>
          </div>
        </div>

        <div class="form-group">
          <label for="confirm-password">Confirmer le mot de passe</label>
          <input 
            id="confirm-password" 
            v-model="resetForm.confirmPassword" 
            type="password" 
            required
            placeholder="Confirmez votre nouveau mot de passe"
          />
          <small 
            v-if="passwordMismatch" 
            class="password-mismatch"
          >
            Les mots de passe ne correspondent pas
          </small>
        </div>

        <button 
          type="submit" 
          class="reset-button" 
          :disabled="isLoading || passwordMismatch || !canReset"
        >
          {{ isLoading ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe' }}
        </button>
      </form>

      <!-- Étape 3: Mot de passe réinitialisé avec succès -->
      <div v-else-if="step === 'success'" class="reset-success-container">
        <div class="success-icon">✓</div>
        <h3>Mot de passe réinitialisé avec succès !</h3>
        <p>Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
        <router-link to="/login" class="login-button">Se connecter</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ResetPasswordView',
  data() {
    return {
      step: 'request', // 'request', 'reset', 'success'
      isLoading: false,
      errorMessage: '',
      successMessage: '',
      requestForm: {
        email: ''
      },
      resetForm: {
        password: '',
        confirmPassword: '',
        token: ''
      }
    }
  },
  computed: {
    passwordMismatch() {
      return this.resetForm.password !== this.resetForm.confirmPassword && 
             this.resetForm.confirmPassword.length > 0;
    },
    passwordStrength() {
      const password = this.resetForm.password;
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
    canReset() {
      return this.resetForm.password.length >= 8 && !this.passwordMismatch;
    }
  },
  methods: {
    async requestReset() {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      try {
        await axios.post('/api/auth/reset-password/request', {
          email: this.requestForm.email
        });
        
        this.successMessage = 'Si cette adresse email est associée à un compte, vous recevrez un lien de réinitialisation.';
        this.requestForm.email = '';
      } catch (error) {
        console.error('Erreur lors de la demande de réinitialisation:', error);
        // Même message pour ne pas révéler si l'email existe
        this.successMessage = 'Si cette adresse email est associée à un compte, vous recevrez un lien de réinitialisation.';
      } finally {
        this.isLoading = false;
      }
    },
    
    async resetPassword() {
      if (this.passwordMismatch) return;
      
      this.isLoading = true;
      this.errorMessage = '';
      
      try {
        await axios.post('/api/auth/reset-password/confirm', {
          token: this.resetForm.token,
          password: this.resetForm.password
        });
        
        this.step = 'success';
      } catch (error) {
        console.error('Erreur lors de la réinitialisation du mot de passe:', error);
        this.errorMessage = error.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe';
      } finally {
        this.isLoading = false;
      }
    },
    
    checkToken() {
      const token = this.$route.query.token;
      
      if (token) {
        this.resetForm.token = token;
        this.step = 'reset';
      }
    }
  },
  mounted() {
    this.checkToken();
  }
}
</script>

<style lang="scss" scoped>
.reset-password-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 20px;
}

.reset-card {
  width: 100%;
  max-width: 450px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.reset-header {
  margin-bottom: 25px;
  text-align: center;
}

.reset-header h2 {
  margin-top: 0;
  margin-bottom: 10px;
}

.reset-description {
  color: #666;
  margin: 0;
}

.reset-error {
  background-color: #FFEBEE;
  color: #D32F2F;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

.reset-success {
  background-color: #E8F5E9;
  color: #2E7D32;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

.reset-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
}

.form-group input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-group input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 1px #4CAF50;
}

.reset-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.reset-button:hover {
  background-color: #388E3C;
}

.reset-button:disabled {
  background-color: #9E9E9E;
  cursor: not-allowed;
}

.form-footer {
  text-align: center;
  margin-top: 15px;
}

.form-footer a {
  color: #4CAF50;
  text-decoration: none;
}

.form-footer a:hover {
  text-decoration: underline;
}

.password-strength {
  margin-top: 10px;
}

.strength-bar {
  height: 5px;
  background-color: #ddd;
  border-radius: 3px;
  margin-bottom: 5px;
}

.strength-bar.weak {
  background-color: #F44336;
}

.strength-bar.medium {
  background-color: #FFC107;
}

.strength-bar.strong {
  background-color: #4CAF50;
}

.password-mismatch {
  color: #F44336;
  font-size: 12px;
  margin-top: 5px;
}

.reset-success-container {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: #4CAF50;
  color: white;
  font-size: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.login-button {
  display: inline-block;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  padding: 12px 25px;
  border-radius: 4px;
  font-size: 16px;
  margin-top: 20px;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #388E3C;
}

@media (max-width: 480px) {
  .reset-card {
    padding: 20px;
  }
}
</style>