<template>
  <header class="app-header">
    <div class="container">
      <div class="logo">
        <router-link to="/">
          <img src="@/assets/logo.svg" alt="Découvrir le Monde" />
          <span>Question pour un compeones</span>
        </router-link>
      </div>
      
      <!-- Menu mobile icon -->
      <button class="mobile-menu-toggle" @click="toggleMenu" :class="{ 'active': menuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <!-- Navigation principale -->
      <nav class="main-nav" :class="{ 'open': menuOpen }">
        <ul>
          <li>
            <router-link to="/" @click="closeMenu">
              <i class="nav-icon home-icon"></i>
              <span>Accueil</span>
            </router-link>
          </li>
          <li>
            <router-link to="/play" @click="closeMenu">
              <i class="nav-icon play-icon"></i>
              <span>Jouer</span>
            </router-link>
          </li>
          <li v-if="isAuthenticated">
            <router-link to="/dashboard" @click="closeMenu">
              <i class="nav-icon dashboard-icon"></i>
              <span>Tableau de bord</span>
            </router-link>
          </li>
          <li v-if="isAuthenticated">
            <router-link to="/quiz" @click="closeMenu">
              <i class="nav-icon quiz-icon"></i>
              <span>Quiz</span>
            </router-link>
          </li>
        </ul>
      </nav>
      
      <!-- Section authentification -->
      <div class="auth-section">
        <template v-if="isAuthenticated">
          <div class="user-profile" @click="toggleUserMenu" ref="userProfile">
            <div class="avatar">
              {{ userInitials }}
            </div>
            <div class="user-info">
              <span class="username">{{ user.username }}</span>
              <span class="dropdown-arrow" :class="{ 'up': userMenuOpen }"></span>
            </div>
            
            <!-- Menu utilisateur -->
            <transition name="dropdown">
              <div class="user-dropdown" v-if="userMenuOpen">
                <div class="dropdown-header">
                  <strong>{{ user.username }}</strong>
                </div>
                <div class="dropdown-body">
                  <router-link to="/profile" @click="closeUserMenu">
                    <i class="profile-icon"></i>
                    <span>Mon profil</span>
                  </router-link>
                  <router-link to="/dashboard" @click="closeUserMenu">
                    <i class="dashboard-icon"></i>
                    <span>Tableau de bord</span>
                  </router-link>
                  <a href="#" @click.prevent="logout">
                    <i class="logout-icon"></i>
                    <span>Déconnexion</span>
                  </a>
                </div>
              </div>
            </transition>
          </div>
        </template>
        <template v-else>
          <router-link to="/login" class="btn btn-login">Connexion</router-link>
          <router-link to="/register" class="btn btn-register">Inscription</router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  data() {
    return {
      menuOpen: false,
      userMenuOpen: false
    }
  },
  computed: {
    isAuthenticated() {
      return this.$store.getters.isAuthenticated;
    },
    user() {
      return this.$store.getters.user;
    },
    userInitials() {
      if (!this.user || !this.user.username) return '?';
      return this.user.username.charAt(0).toUpperCase();
    }
  },
  methods: {
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
      if (this.menuOpen) {
        this.userMenuOpen = false;
      }
    },
    closeMenu() {
      this.menuOpen = false;
    },
    toggleUserMenu() {
      this.userMenuOpen = !this.userMenuOpen;
    },
    closeUserMenu() {
      this.userMenuOpen = false;
    },
    logout() {
      this.$store.dispatch('logout');
      this.userMenuOpen = false;
      this.$router.push('/');
    }
  },
  mounted() {
    // Fermer le menu utilisateur quand on clique en dehors
    document.addEventListener('click', (e) => {
      if (this.userMenuOpen && this.$refs.userProfile && !this.$refs.userProfile.contains(e.target)) {
        this.userMenuOpen = false;
      }
    });
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }
}
</script>

<style lang="scss" scoped>
.app-header {
  background: linear-gradient(to right, #4CAF50, #2E7D32);
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 1000;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
  }

  // Logo styling
  .logo {
    a {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: white;
      font-weight: 600;
      font-size: 1.1rem;
      transition: opacity 0.3s;

      &:hover {
        opacity: 0.9;
      }
    }

    img {
      height: 40px;
      margin-right: 12px;
    }
    
    span {
      white-space: nowrap;
    }
  }

  // Main navigation
  .main-nav {
    ul {
      display: flex;
      list-style: none;
      padding: 0;
      margin: 0;
      height: 100%;

      li {
        position: relative;
        margin: 0;
        height: 100%;
        display: flex;
        align-items: center;

        a {
          display: flex;
          align-items: center;
          padding: 0 20px;
          height: 70px;
          text-decoration: none;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
          transition: all 0.3s;
          position: relative;

          .nav-icon {
            margin-right: 8px;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          &:hover {
            color: white;
            background-color: rgba(255, 255, 255, 0.1);
          }

          &.router-link-active {
            color: white;
            font-weight: 600;
            
            &::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100%;
              height: 3px;
              background-color: white;
              border-radius: 3px 3px 0 0;
            }
          }
        }
      }
    }
  }

  // Auth section
  .auth-section {
    display: flex;
    align-items: center;
    
    .btn {
      padding: 10px 18px;
      border-radius: 30px;
      text-decoration: none;
      font-weight: 500;
      margin-left: 10px;
      transition: all 0.3s;
      font-size: 0.95rem;
    }

    .btn-login {
      background-color: transparent;
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.5);
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        border-color: white;
      }
    }

    .btn-register {
      background-color: white;
      color: #4CAF50;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      }
    }
  }

  // User profile
  .user-profile {
    position: relative;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 8px 10px;
    border-radius: 30px;
    transition: background-color 0.3s;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .avatar {
      width: 36px;
      height: 36px;
      background-color: white;
      color: #4CAF50;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-weight: 600;
      margin-right: 10px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    
    .user-info {
      display: flex;
      align-items: center;
      
      .username {
        color: white;
        font-weight: 500;
      }
      
      .dropdown-arrow {
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 5px solid white;
        margin-left: 8px;
        transition: transform 0.2s;
        
        &.up {
          transform: rotate(180deg);
        }
      }
    }
  }

  // User dropdown
  .user-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    background: white;
    border-radius: 8px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
    min-width: 200px;
    z-index: 100;
    overflow: hidden;
    
    // Triangle pointer
    &::before {
      content: '';
      position: absolute;
      top: -5px;
      right: 20px;
      width: 10px;
      height: 10px;
      background-color: white;
      transform: rotate(45deg);
    }
    
    .dropdown-header {
      padding: 15px;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .dropdown-body {
      a {
        display: flex;
        align-items: center;
        padding: 12px 15px;
        text-decoration: none;
        color: #333;
        transition: background-color 0.2s;
        
        i {
          margin-right: 10px;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.7;
        }
        
        &:hover {
          background-color: #f8f8f8;
          color: #4CAF50;
        }
      }
    }
  }
  
  // Transition pour le dropdown
  .dropdown-enter-active, .dropdown-leave-active {
    transition: opacity 0.3s, transform 0.3s;
    transform-origin: top right;
  }
  
  .dropdown-enter-from, .dropdown-leave-to {
    opacity: 0;
    transform: scale(0.95);
  }

  // Mobile menu toggle
  .mobile-menu-toggle {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    flex-direction: column;
    justify-content: space-between;
    height: 20px;
    width: 25px;
    padding: 0;
    z-index: 200;
    
    span {
      display: block;
      height: 2px;
      width: 100%;
      background-color: white;
      border-radius: 2px;
      transition: all 0.3s;
    }
    
    &.active {
      span:first-child {
        transform: translateY(9px) rotate(45deg);
      }
      
      span:nth-child(2) {
        opacity: 0;
      }
      
      span:last-child {
        transform: translateY(-9px) rotate(-45deg);
      }
    }
  }

  // Icons
  .home-icon::before { content: "🏠"; }
  .play-icon::before { content: "🎮"; }
  .dashboard-icon::before { content: "📊"; }
  .quiz-icon::before { content: "❓"; }
  .profile-icon::before { content: "👤"; }
  .logout-icon::before { content: "🚪"; }
  
  // Media queries
  @media (max-width: 900px) {
    .logo span {
      display: none;
    }
  }

  @media (max-width: 768px) {
    .mobile-menu-toggle {
      display: flex;
    }
    
    .main-nav {
      position: fixed;
      top: 70px;
      left: 0;
      right: 0;
      background: #3c8e41;
      height: 0;
      overflow: hidden;
      transition: height 0.3s ease-in-out;
      box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
      
      &.open {
        height: auto;
      }
      
      ul {
        flex-direction: column;
        padding: 10px 0;
        
        li {
          height: auto;
          
          a {
            height: auto;
            padding: 15px 20px;
            width: 100%;
            
            &.router-link-active::after {
              display: none;
            }
          }
        }
      }
    }
    
    .auth-section {
      .btn-login {
        display: none;
      }
    }
    
    .user-profile {
      .user-info {
        display: none;
      }
    }
    
    .user-dropdown {
      right: -10px;
      
      &::before {
        right: 15px;
      }
    }
  }
}
</style>