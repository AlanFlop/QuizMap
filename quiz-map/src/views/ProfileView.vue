<template>
    <div class="profile-view">
      <div class="profile-container">
        <h1>Profil utilisateur</h1>
        
        <div v-if="isLoading">
          <p class="loading">Chargement du profil...</p>
        </div>
        
        <div v-else class="profile-content">
          <div class="profile-header">
            <div class="profile-avatar">
              {{ userInitials }}
            </div>
            <div class="profile-info">
              <h2>{{ user.username }}</h2>
              <p class="profile-email">{{ user.email }}</p>
              <p class="profile-date">Membre depuis {{ formattedJoinDate }}</p>
            </div>
          </div>
          
          <div class="profile-tabs">
            <button 
              :class="{ active: activeTab === 'account' }" 
              @click="activeTab = 'account'"
            >
              Compte
            </button>
            <button 
              :class="{ active: activeTab === 'security' }" 
              @click="activeTab = 'security'"
            >
              Sécurité
            </button>
          </div>
          
          <div v-if="activeTab === 'account'" class="account-settings">
            <form @submit.prevent="updateProfile">
              <div class="form-group">
                <label for="username">Nom d'utilisateur</label>
                <input 
                  id="username" 
                  v-model="profileForm.username" 
                  type="text" 
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="email">Email</label>
                <input 
                  id="email" 
                  v-model="profileForm.email" 
                  type="email" 
                  required
                />
              </div>
              
              <div class="form-group">
                <label>Score total</label>
                <div class="readonly-field">{{ user.score || 0 }} pays découverts</div>
              </div>
              
              <div class="form-actions">
                <button type="submit" class="save-button" :disabled="updating">
                  {{ updating ? 'Enregistrement...' : 'Enregistrer les modifications' }}
                </button>
              </div>
            </form>
          </div>
          
          <div v-if="activeTab === 'security'" class="security-settings">
            <form @submit.prevent="updatePassword">
              <div class="form-group">
                <label for="current-password">Mot de passe actuel</label>
                <input 
                  id="current-password" 
                  v-model="passwordForm.currentPassword" 
                  type="password" 
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="new-password">Nouveau mot de passe</label>
                <input 
                  id="new-password" 
                  v-model="passwordForm.newPassword" 
                  type="password" 
                  required
                />
                <div class="password-strength" v-if="passwordForm.newPassword">
                  <div 
                    class="strength-bar" 
                    :style="{ width: `${passwordStrength}%` }"
                    :class="strengthClass"
                  ></div>
                  <small>{{ strengthText }}</small>
                </div>
              </div>
              
              <div class="form-group">
                <label for="confirm-password">Confirmer le nouveau mot de passe</label>
                <input 
                  id="confirm-password" 
                  v-model="passwordForm.confirmPassword" 
                  type="password" 
                  required
                />
                <small 
                  v-if="passwordMismatch" 
                  class="password-mismatch"
                >
                  Les mots de passe ne correspondent pas
                </small>
              </div>
              
              <div class="form-actions">
                <button 
                  type="submit" 
                  class="save-button" 
                  :disabled="updating || passwordMismatch || passwordForm.newPassword.length < 8"
                >
                  {{ updating ? 'Mise à jour...' : 'Mettre à jour le mot de passe' }}
                </button>
              </div>
            </form>
            
            <div class="danger-zone">
              <h3>Zone de danger</h3>
              <p>Attention, ces actions sont irréversibles.</p>
              <button class="delete-account" @click="confirmDeleteAccount">
                Supprimer mon compte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'ProfileView',
    data() {
      return {
        activeTab: 'account',
        isLoading: true,
        updating: false,
        profileForm: {
          username: '',
          email: ''
        },
        passwordForm: {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
      };
    },
    computed: {
      user() {
        return this.$store.getters.user || {};
      },
      userInitials() {
        if (!this.user.username) return '?';
        return this.user.username.substring(0, 2).toUpperCase();
      },
      formattedJoinDate() {
        if (!this.user.registeredAt) return '-';
        
        const date = new Date(this.user.registeredAt);
        return date.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      },
      passwordMismatch() {
        return this.passwordForm.newPassword !== this.passwordForm.confirmPassword && 
               this.passwordForm.confirmPassword.length > 0;
      },
      passwordStrength() {
        const password = this.passwordForm.newPassword;
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
      }
    },
    methods: {
      loadUserData() {
        if (this.user) {
          this.profileForm.username = this.user.username || '';
          this.profileForm.email = this.user.email || '';
          this.isLoading = false;
        }
      },
      
      async updateProfile() {
        this.updating = true;
        
        try {
          const response = await axios.put('/api/user/profile', {
            username: this.profileForm.username,
            email: this.profileForm.email
          });
          
          // Mettre à jour les informations utilisateur dans le store
          this.$store.commit('setUser', response.data);
          
          // Mettre à jour également dans le localStorage
          localStorage.setItem('user', JSON.stringify(response.data));
          
          alert('Profil mis à jour avec succès !');
        } catch (error) {
          console.error('Erreur lors de la mise à jour du profil:', error);
          alert(error.response?.data?.message || 'Une erreur est survenue lors de la mise à jour du profil');
        } finally {
          this.updating = false;
        }
      },
      
      async updatePassword() {
        if (this.passwordMismatch) return;
        
        this.updating = true;
        
        try {
          await axios.put('/api/user/password', {
            currentPassword: this.passwordForm.currentPassword,
            newPassword: this.passwordForm.newPassword
          });
          
          // Réinitialiser le formulaire
          this.passwordForm = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          };
          
          alert('Mot de passe mis à jour avec succès !');
        } catch (error) {
          console.error('Erreur lors de la mise à jour du mot de passe:', error);
          alert(error.response?.data?.message || 'Une erreur est survenue lors de la mise à jour du mot de passe');
        } finally {
          this.updating = false;
        }
      },
      
      confirmDeleteAccount() {
        if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
          this.deleteAccount();
        }
      },
      
      async deleteAccount() {
        try {
          await axios.delete('/api/user/account');
          
          // Déconnecter l'utilisateur
          this.$store.dispatch('logout');
          
          // Rediriger vers la page d'accueil
          this.$router.push('/');
          
          alert('Votre compte a été supprimé avec succès.');
        } catch (error) {
          console.error('Erreur lors de la suppression du compte:', error);
          alert(error.response?.data?.message || 'Une erreur est survenue lors de la suppression du compte');
        }
      }
    },
    mounted() {
      if (!this.$store.getters.isAuthenticated) {
        this.$router.push('/login?redirect=/profile');
        return;
      }
      
      this.loadUserData();
    },
    watch: {
      user() {
        this.loadUserData();
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .profile-view {
    padding: 20px;
  }
  
  .profile-container {
    max-width: 800px;
    margin: 0 auto;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    padding: 30px;
  }
  
  h1 {
    text-align: center;
    margin-top: 0;
    margin-bottom: 30px;
  }
  
  .loading {
    text-align: center;
    color: #666;
    padding: 30px 0;
  }
  
  .profile-header {
    display: flex;
    align-items: center;
    margin-bottom: 30px;
  }
  
  .profile-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background-color: #4CAF50;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    font-weight: bold;
    margin-right: 20px;
  }
  
  .profile-info h2 {
    margin: 0;
    margin-bottom: 5px;
  }
  
  .profile-email {
    color: #666;
    margin: 0;
    margin-bottom: 5px;
  }
  
  .profile-date {
    font-size: 0.9rem;
    color: #888;
    margin: 0;
  }
  
  .profile-tabs {
    display: flex;
    border-bottom: 1px solid #eee;
    margin-bottom: 30px;
  }
  
  .profile-tabs button {
    background: none;
    border: none;
    padding: 15px 20px;
    font-size: 16px;
    font-weight: 500;
    color: #666;
    cursor: pointer;
    position: relative;
  }
  
  .profile-tabs button.active {
    color: #4CAF50;
  }
  
  .profile-tabs button.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: #4CAF50;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  .form-group input {
    width: 100%;
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
  
  .readonly-field {
    padding: 12px;
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 4px;
    color: #666;
  }
  
  .form-actions {
    text-align: right;
    margin-top: 30px;
  }
  
  .save-button {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 12px 25px;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
  }
  
  .save-button:disabled {
    background-color: #9E9E9E;
    cursor: not-allowed;
  }
  
  .danger-zone {
    margin-top: 50px;
    padding-top: 30px;
    border-top: 1px solid #eee;
  }
  
  .danger-zone h3 {
    color: #F44336;
    margin-top: 0;
  }
  
  .delete-account {
    background-color: #F44336;
    color: white;
    border: none;
    padding: 12px 25px;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    margin-top: 15px;
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
    font-size: 0.9rem;
    margin-top: 5px;
  }
  
  @media (max-width: 768px) {
    .profile-header {
      flex-direction: column;
      text-align: center;
    }
    
    .profile-avatar {
      margin-right: 0;
      margin-bottom: 20px;
    }
  }
  </style>