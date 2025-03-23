<template>
    <div class="world-map-wrapper" ref="mapContainer">
      <object 
        type="image/svg+xml" 
        data="/assets/maps/world-1.svg" 
        class="world-map-svg"
        ref="svgObject"
        @load="onSvgLoaded"
      >
        Votre navigateur ne supporte pas les SVG.
      </object>
    </div>
  </template>
  
  <script>
  export default {
    name: 'WorldMapSVG',
    data() {
      return {
        animationId: null,
        position: 0,
        direction: 1,
        speed: 0.2,
        svgDocument: null
      }
    },
    mounted() {
      window.addEventListener('resize', this.handleResize);
    },
    beforeDestroy() {
      this.stopAnimation();
      window.removeEventListener('resize', this.handleResize);
    },
    methods: {
// Événement déclenché quand le SVG est chargé
onSvgLoaded() {
  try {
    console.log("SVG chargé");
    
    // Récupérer le document SVG
    const svgObject = this.$refs.svgObject;
    if (!svgObject || !svgObject.contentDocument) {
      console.error("Impossible d'accéder au document SVG");
      return;
    }
    
    this.svgDocument = svgObject.contentDocument;
    this.svgLoaded = true;
    
    // Ajuster le viewBox du SVG pour qu'il soit mieux centré
    const svgElement = this.svgDocument.querySelector('svg');
    if (svgElement) {
      // Le viewBox original est probablement quelque chose comme "0 0 width height"
      // Ajustez-le pour qu'il soit légèrement déplacé vers la droite
      const currentViewBox = svgElement.getAttribute('viewBox');
      if (currentViewBox) {
        const values = currentViewBox.split(' ').map(Number);
        if (values.length === 4) {
          // Déplacer légèrement vers la droite et ajuster la hauteur si nécessaire
          const newViewBox = `${values[0] - 20} ${values[1]} ${values[2]} ${values[3]}`;
          svgElement.setAttribute('viewBox', newViewBox);
        }
      }
    }
    
    // Initialiser les couleurs des pays
    this.resetCountryColors();
    
    // Ajouter les événements de clic
    this.setupSvgInteractions();
    
  } catch (error) {
    console.error("Erreur lors du chargement de la carte SVG:", error);
  }
},
      
      startAnimation() {
        const animate = () => {
          // Mise à jour de la position
          this.position += this.speed * this.direction;
          
          // Inverser la direction lorsqu'on atteint les limites
          if (Math.abs(this.position) > 50) { // Augmenté pour un mouvement plus large
            this.direction *= -1;
          }
          
          // Appliquer la transformation
          if (this.$refs.mapContainer) {
            this.$refs.mapContainer.style.transform = `translateX(${this.position}px)`;
          }
          
          // Continuer l'animation
          this.animationId = requestAnimationFrame(animate);
        };
        
        // Démarrer l'animation
        this.animationId = requestAnimationFrame(animate);
      },
      
      stopAnimation() {
        if (this.animationId) {
          cancelAnimationFrame(this.animationId);
          this.animationId = null;
        }
      },
      
      handleResize() {
        // Ajuster la taille ou les paramètres d'animation si nécessaire
        this.stopAnimation();
        this.startAnimation();
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .world-map-wrapper {
    width: 100%;
    height: 100%;
    transition: transform 0.1s ease;
    overflow: hidden; /* Important pour éviter les barres de défilement */
    
    .world-map-svg {
      width: 100%;
      height: 100%;
      opacity: 0.4; /* Augmenté de 0.2 à 0.4 pour plus de visibilité */
      display: block;
    }
  }
  
  /* Ajouter ces règles pour aider à la compatibilité */
  :deep(svg) {
    max-width: none !important; /* Annule toute restriction de largeur maximale */
  }
  </style>