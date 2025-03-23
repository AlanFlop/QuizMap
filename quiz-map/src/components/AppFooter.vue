<template>
    <footer class="app-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-logo">
            <img src="@/assets/logo.svg" alt="Découvrir le Monde" />
            <p>Découvrir le Monde</p>
            <p class="tagline">Apprenez la géographie mondiale de façon ludique</p>
          </div>
          <div class="footer-links">
            <div class="link-group">
              <h4>Navigation</h4>
              <ul>
                <li><router-link to="/">Accueil</router-link></li>
                <li><router-link to="/play">Jouer</router-link></li>
                <li><router-link to="/leaderboard">Classement</router-link></li>
                <li><router-link to="/quiz">Quiz</router-link></li>
              </ul>
            </div>
            <div class="link-group">
              <h4>Compte</h4>
              <ul>
                <li><router-link to="/login">Connexion</router-link></li>
                <li><router-link to="/register">Inscription</router-link></li>
                <li><router-link to="/profile">Profil</router-link></li>
                <li><router-link to="/dashboard">Tableau de bord</router-link></li>
              </ul>
            </div>
            <div class="link-group">
              <h4>Informations</h4>
              <ul>
                <li><a href="#">À propos</a></li>
                <li><a href="#">Conditions d'utilisation</a></li>
                <li><a href="#">Politique de confidentialité</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; {{ currentYear }} Découvrir le Monde. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  </template>
  
  <script>
  export default {
    name: 'AppFooter',
    computed: {
      currentYear() {
        return new Date().getFullYear();
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .app-footer {
    background-color: #333;
    color: white;
    padding: 40px 0 20px;
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }
    
    .footer-content {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    
    .footer-logo {
      flex: 1;
      min-width: 200px;
      margin-right: 40px;
      margin-bottom: 20px;
      
      img {
        height: 50px;
        margin-bottom: 10px;
      }
      
      p {
        margin: 5px 0;
        font-weight: bold;
      }
      
      .tagline {
        font-weight: normal;
        font-size: 0.9rem;
        opacity: 0.8;
      }
    }
    
    .footer-links {
      display: flex;
      flex-wrap: wrap;
      flex: 2;
    }
    
    .link-group {
      flex: 1;
      min-width: 150px;
      margin-bottom: 20px;
      
      h4 {
        margin-top: 0;
        margin-bottom: 15px;
        color: #4CAF50;
      }
      
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        
        li {
          margin-bottom: 8px;
          
          a {
            color: #ccc;
            text-decoration: none;
            
            &:hover {
              color: white;
            }
          }
        }
      }
    }
    
    .footer-bottom {
      border-top: 1px solid #444;
      padding-top: 20px;
      text-align: center;
      font-size: 0.9rem;
      opacity: 0.7;
    }
    
    @media (max-width: 768px) {
      .footer-content {
        flex-direction: column;
      }
      
      .footer-logo {
        margin-right: 0;
        text-align: center;
      }
      
      .link-group {
        min-width: 120px;
      }
    }
  }
  </style>