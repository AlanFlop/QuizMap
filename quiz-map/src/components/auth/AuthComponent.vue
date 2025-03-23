<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h2>{{ isLogin ? 'Connexion' : 'Inscription' }}</h2>
        <div class="auth-tabs">
          <button 
            :class="{ active: isLogin }" 
            @click="isLogin = true"
          >
            Connexion
          </button>
          <button 
            :class="{ active: !isLogin }" 
            @click="isLogin = false"
          >
            Inscription
          </button>
        </div>
      </div>

      <div v-if="errorMessage" class="auth-error">
        {{ errorMessage }}
      </div>

      <!-- Formulaire de connexion -->
      <form v-if="isLogin" @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="login-email">Email</label>
          <input 
            id="login-email" 
            v-model="loginForm.email" 
            type="email" 
            required
            placeholder="votre@email.com"
          />
        </div>

        <div class="form-group">
          <label for="login-password">Mot de passe</label>
          <input 
            id="login-password" 
            v-model="loginForm.password" 
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
            v-model="loginForm.rememberMe" 
            type="checkbox"
          />
          <label for="remember-me">Se souvenir de moi</label>
        </div>

        <button type="submit" class="auth-button" :disabled="isLoading">
          {{ isLoading ? 'Connexion en cours...' : 'Se connecter' }}
        </button>
      </form>

      <!-- Formulaire d'inscription -->
      <form v-else @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="register-username">Nom d'utilisateur</label>
          <input 
            id="register-username" 
            v-model="registerForm.username" 
            type="text" 
            required
            placeholder="Choisissez un nom d'utilisateur"
          />
        </div>

        <div class="form-group">
          <label for="register-email">Email</label>
          <input 
            id="register-email" 
            v-model="registerForm.email" 
            type="email" 
            required
            placeholder="votre@email.com"
          />
        </div>

        <div class="form-group">
          <label for="register-password">Mot de passe</label>
          <input 
            id="register-password" 
            v-model="registerForm.password" 
            type="password" 
            required
            placeholder="Créez un mot de passe sécurisé"
          />
          <div class="password-strength" v-if="registerForm.password">
            <div 
              class="strength-bar" 
              :style="{ width: `${passwordStrength}%` }"
              :class="strengthClass"
            ></div>
            <small>{{ strengthText }}</small>
          </div>
        </div>

        <div class="form-group">
          <label for="register-confirm">Confirmer le mot de passe</label>
          <input 
            id="register-confirm" 
            v-model="registerForm.confirmPassword" 
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
            v-model="registerForm.acceptTerms" 
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
          :disabled="isLoading || !canRegister"
        >
          {{ isLoading ? 'Inscription en cours...' : 'S\'inscrire' }}
        </button>
      </form>

      <div class="social-login">
        <p>Ou se connecter avec</p>
        <div class="social-buttons">
          <button type="button" class="google-btn" @click="socialLogin('google')">Google</button>
          <button type="button" class="facebook-btn" @click="socialLogin('facebook')">Facebook</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AuthService from '@/services/auth.service';

export default {
  name: 'AuthComponent',
  data() {
    return {
      isLogin: true,
      isLoading: false,
      errorMessage: '',
      loginForm: {
        email: '',
        password: '',
        rememberMe: false
      },
      registerForm: {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false
      }
    }
  },
  computed: {
    passwordMismatch() {
      return this.registerForm.password !== this.registerForm.confirmPassword && 
             this.registerForm.confirmPassword.length > 0;
    },
    passwordStrength() {
      const password = this.registerForm.password;
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
             this.registerForm.acceptTerms && 
             this.registerForm.username.length > 0 &&
             this.registerForm.email.length > 0 &&
             this.registerForm.password.length >= 8;
    }
  },
  methods: {
    async handleLogin() {
      this.isLoading = true;
      this.errorMessage = '';
      
      console.log('🔑 Tentative de connexion avec:', {
        email: this.loginForm.email,
        password: '***masqué***',
        rememberMe: this.loginForm.rememberMe
      });
      
      try {
        console.group('📡 Appel du service d\'authentification - login');
        // Utiliser le service d'authentification
        const credentials = {
          email: this.loginForm.email,
          password: this.loginForm.password,
          rememberMe: this.loginForm.rememberMe
        };
        const { token, user } = await AuthService.login(credentials);
        console.log('✅ Login réussi. Token reçu:', token ? 'Oui' : 'Non');
        console.log('✅ User reçu:', user);
        console.groupEnd();
        
        // Stocker l'utilisateur dans le localStorage
        localStorage.setItem('user', JSON.stringify(user));
        console.log('💾 User stocké dans localStorage');
        
        // Mettre à jour le store
        console.group('🔄 Mise à jour du store');
        try {
          if (this.$store.commit) {
            console.log('Commit des mutations: setUser et setToken');
            // Vérifier si le module auth est namespaced
            if (this.$store._modulesNamespaceMap && this.$store._modulesNamespaceMap['auth/']) {
              console.log('Module auth namespaced détecté, utilisation de auth/setUser');
              this.$store.commit('auth/setUser', user);
              this.$store.commit('auth/setToken', token);
            } else {
              console.log('Module auth non-namespaced ou non détecté, utilisation de setUser');
              this.$store.commit('setUser', user);
              this.$store.commit('setToken', token);
            }
            console.log('✅ Mutations terminées');
          } else {
            console.error('❌ Store non disponible ou méthode commit non trouvée');
          }
        } catch (storeError) {
          console.error('❌ Erreur lors de la mise à jour du store:', storeError);
        }
        console.groupEnd();
        
        // Rediriger vers la page d'accueil ou la page précédente
        const redirectPath = this.$route.query.redirect || '/';
        console.log('🔀 Redirection vers:', redirectPath);
        this.$router.push(redirectPath);
        
      } catch (error) {
        console.group('❌ Erreur de connexion');
        console.error('Message d\'erreur:', error);
        if (error.response) {
          console.error('Détails de la réponse d\'erreur:', {
            status: error.response.status,
            data: error.response.data
          });
        }
        console.groupEnd();
        
        this.errorMessage = 'Email ou mot de passe incorrect';
      } finally {
        this.isLoading = false;
      }
    },
    
    async handleRegister() {
      this.isLoading = true;
      this.errorMessage = '';
      
      console.log('📝 Tentative d\'inscription avec:', {
        username: this.registerForm.username,
        email: this.registerForm.email,
        password: '***masqué***'
      });
      
      try {
        console.group('📡 Appel du service d\'authentification - register');
        // Utiliser le service d'authentification
        const userData = {
          username: this.registerForm.username,
          email: this.registerForm.email,
          password: this.registerForm.password
        };
        await AuthService.register(userData);
        console.log('✅ Inscription réussie');
        console.groupEnd();
        
        // En cas de succès, basculer vers le formulaire de connexion
        this.isLogin = true;
        this.loginForm.email = this.registerForm.email;
        this.loginForm.password = '';
        console.log('🔄 Basculement vers le formulaire de connexion');
        
        // Message de succès
        console.log('📣 Affichage du message de succès');
        this.showSuccessMessage('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        
      } catch (error) {
        console.group('❌ Erreur d\'inscription');
        console.error('Message d\'erreur:', error);
        if (error.response) {
          console.error('Détails de la réponse d\'erreur:', {
            status: error.response.status,
            data: error.response.data
          });
        } else if (error.request) {
          console.error('Pas de réponse reçue du serveur:', error.request);
        } else {
          console.error('Erreur lors de la configuration de la requête:', error.message);
        }
        console.groupEnd();
        
        this.errorMessage = error.response?.data?.message || 'Une erreur est survenue lors de l\'inscription';
      } finally {
        this.isLoading = false;
      }
    },
    
    forgotPassword() {
      // Rediriger vers la page de récupération de mot de passe
      this.$router.push('/reset-password');
    },
    
    socialLogin(provider) {
      // Implémentation de la connexion via réseaux sociaux
      console.log(`Connexion via ${provider} (à implémenter)`);
      this.errorMessage = `La connexion via ${provider} n'est pas encore disponible`;
    },
    
    showSuccessMessage(message) {
      // Cette méthode pourrait être améliorée avec un système de notification
      alert(message);
    }
  }
}
</script>

<style lang="scss" scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 20px;
}

.auth-card {
  width: 100%;
  max-width: 450px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.auth-header {
  margin-bottom: 20px;
  text-align: center;
}

.auth-tabs {
  display: flex;
  margin-top: 15px;
  border-bottom: 1px solid #eee;
}

.auth-tabs button {
  flex: 1;
  background: none;
  border: none;
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
  color: #666;
  position: relative;
}

.auth-tabs button.active {
  color: #4CAF50;
}

.auth-tabs button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #4CAF50;
}

.auth-error {
  background-color: #FFEBEE;
  color: #D32F2F;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 14px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-size: 14px;
  color: #555;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"] {
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

.remember-me, .terms {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.forgot-password {
  text-align: right;
  color: #4CAF50;
  cursor: pointer;
  font-size: 14px;
  margin-top: 5px;
}

.forgot-password:hover {
  text-decoration: underline;
}

.auth-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.auth-button:hover {
  background-color: #388E3C;
}

.auth-button:disabled {
  background-color: #9E9E9E;
  cursor: not-allowed;
}

.social-login {
  margin-top: 25px;
  text-align: center;
}

.social-login p {
  color: #666;
  margin-bottom: 15px;
  position: relative;
}

.social-login p::before,
.social-login p::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 30%;
  height: 1px;
  background-color: #eee;
}

.social-login p::before {
  left: 0;
}

.social-login p::after {
  right: 0;
}

.social-buttons {
  display: flex;
  gap: 10px;
}

.social-buttons button {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.social-buttons button:hover {
  background-color: #f5f5f5;
}

.google-btn {
  color: #DB4437;
}

.facebook-btn {
  color: #4267B2;
}

.password-strength {
  margin-top: 8px;
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

a {
  color: #4CAF50;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 20px;
  }
  
  .social-login p::before,
  .social-login p::after {
    width: 25%;
  }
}
</style>