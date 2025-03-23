<template>
    <div class="hero-banner">
      <div class="map-animation-container">
        <WorldMapSVG />
      </div>
      <div class="content-container">
        <div class="hero-content">
          <h1>Questions pour un Champion</h1>
          <h2>Testez vos connaissances<br />et participez à l'émission iconique !</h2>
          <p>Relevez les défis géographiques et culturels pour être sélectionné<br />parmi les meilleurs candidats de France</p>
          <div class="cta-buttons">
            <router-link to="/jeu" class="btn btn-primary">
              <span class="icon">🎮</span>
              Commencer le jeu
            </router-link>
            <router-link to="/selection" class="btn btn-secondary">
              <span class="icon">🏆</span>
              Comment être sélectionné
            </router-link>
          </div>
          <div class="stats-badges">
            <div class="badge">
              <span class="number">10K+</span>
              <span class="label">Joueurs</span>
            </div>
            <div class="badge">
              <span class="number">197</span>
              <span class="label">Pays</span>
            </div>
            <div class="badge">
              <span class="number">50</span>
              <span class="label">Sélectionnés</span>
            </div>
          </div>
        </div>
      </div>
      <div class="hero-wave">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 200">
          <path fill="#ffffff" fill-opacity="1" d="M0,160L48,144C96,128,192,96,288,90.7C384,85,480,107,576,128C672,149,768,171,864,165.3C960,160,1056,128,1152,112C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </div>
  </template>
  
  <script>
import WorldMapSVG from './WorldMapSVG.vue'

export default {
  components: {
    WorldMapSVG
  },
  // ...
}
  </script>
  
  <style lang="scss" scoped>
  .hero-banner {
    position: relative;
    height: 100vh;
    min-height: 700px;
    width: 100%;
    overflow: hidden;
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
    
    .map-animation-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 120%;
      height: 100%;
      opacity: 0.2;
      z-index: 1;
    }
    
    .content-container {
      position: relative;
      z-index: 2;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
    }
    
    .hero-content {
      text-align: center;
      color: #ffffff;
      max-width: 900px;
      
      h1 {
        font-size: 5rem;
        font-weight: 800;
        margin-bottom: 1.5rem;
        text-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        
        @media (max-width: 768px) {
          font-size: 3rem;
        }
      }
      
      h2 {
        font-size: 2.2rem;
        font-weight: 600;
        margin-bottom: 1.5rem;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        
        @media (max-width: 768px) {
          font-size: 1.8rem;
        }
      }
      
      p {
        font-size: 1.4rem;
        margin-bottom: 3rem;
        opacity: 0.9;
        line-height: 1.6;
        
        @media (max-width: 768px) {
          font-size: 1.1rem;
        }
      }
    }
    
    .cta-buttons {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
      margin-bottom: 3rem;
      
      @media (max-width: 768px) {
        flex-direction: column;
        gap: 1rem;
      }
      
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 1rem 2rem;
        font-size: 1.2rem;
        font-weight: 600;
        border-radius: 50px;
        text-decoration: none;
        transition: all 0.3s ease;
        min-width: 220px;
        
        .icon {
          margin-right: 0.5rem;
          font-size: 1.4rem;
        }
        
        &.btn-primary {
          background-color: #ffffff;
          color: #3b82f6;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          
          &:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
          }
        }
        
        &.btn-secondary {
          background-color: rgba(255, 255, 255, 0.2);
          color: #ffffff;
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          
          &:hover {
            background-color: rgba(255, 255, 255, 0.3);
            transform: translateY(-5px);
          }
        }
      }
    }
    
    .stats-badges {
      display: flex;
      justify-content: center;
      gap: 3rem;
      
      @media (max-width: 768px) {
        gap: 1.5rem;
      }
      
      .badge {
        display: flex;
        flex-direction: column;
        align-items: center;
        
        .number {
          font-size: 2.2rem;
          font-weight: 800;
          margin-bottom: 0.2rem;
          color: #ffffff;
          
          @media (max-width: 768px) {
            font-size: 1.8rem;
          }
        }
        
        .label {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.8);
          
          @media (max-width: 768px) {
            font-size: 0.9rem;
          }
        }
      }
    }
    
    .hero-wave {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      z-index: 3;
      line-height: 0;
      
      svg {
        width: 100%;
        height: auto;
      }
    }
  }
  </style>