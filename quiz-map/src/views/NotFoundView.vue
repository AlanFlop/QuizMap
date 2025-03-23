<template>
    <div class="not-found">
      <div class="not-found-content">
        <h1>404</h1>
        <h2>Page non trouvée</h2>
        <p>Désolé, la page que vous recherchez n'existe pas ou a été déplacée.</p>
        <router-link to="/" class="home-button">Retour à l'accueil</router-link>
      </div>
      <div class="not-found-image">
        <img src="@/assets/world-map.svg" alt="Carte du monde" />
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'NotFoundView'
  }
  </script>
  
  <style lang="scss" scoped>
  .not-found {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 200px);
    padding: 20px;
    text-align: center;
  }
  
  .not-found-content {
    max-width: 500px;
  }
  
  .not-found-content h1 {
    font-size: 6rem;
    margin: 0;
    color: #4CAF50;
  }
  
  .not-found-content h2 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #333;
  }
  
  .not-found-content p {
    margin-bottom: 30px;
    color: #666;
  }
  
  .home-button {
    display: inline-block;
    background-color: #4CAF50;
    color: white;
    padding: 10px 20px;
    border-radius: 4px;
    text-decoration: none;
    transition: background-color 0.3s;
  }
  
  .home-button:hover {
    background-color: #388E3C;
  }
  
  .not-found-image {
    display: none;
  }
  
  @media (min-width: 768px) {
    .not-found {
      text-align: left;
    }
    
    .not-found-image {
      display: block;
      margin-left: 40px;
    }
    
    .not-found-image img {
      max-width: 300px;
      opacity: 0.5;
    }
  }
  </style>