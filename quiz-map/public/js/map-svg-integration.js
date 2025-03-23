// Ce fichier doit être placé dans le dossier public/js/
// et être inclus dans index.html via:
// <script src="/js/mapsvg-integration.js"></script>

// Fonction pour initialiser MapSVG
function initMapSVG(containerId, svgPath) {
    return new mapsvg.map(containerId, {
      options: {
        source: svgPath,
        loadingText: "Chargement de la carte...",
        colors: {
          baseDefault: "#d3d3d3",
          background: "transparent", 
          selected: "#4CAF50",
          hover: "#e0e0e0",
          directory: "#fafafa",
          status: {}
        },
        zoom: {
          on: true,
          limit: [0, 10],
          mousewheel: true,
          buttons: {
            on: true,
            location: 'right'
          }
        },
        scroll: {
          on: true,
          limit: false,
          background: false,
          spacebar: false
        },
        tooltips: {
          on: true,
          position: 'bottom-right',
          template: "{{id}}: {{title}}",
          mode: 'mobile'
        }
      }
    });
  }
  
  // Fonction pour colorer un pays
  function colorCountry(map, countryCode, color) {
    const region = map.getRegion(countryCode);
    if (region) {
      region.setFill(color || '#4CAF50');
      return true;
    }
    return false;
  }
  
  // Fonction pour réinitialiser les couleurs
  function resetCountryColors(map, defaultColor) {
    const regions = map.regionsRepository.getLoaded();
    regions.forEach(region => {
      region.setFill(defaultColor || '#d3d3d3');
    });
  }
  
  // Fonction pour obtenir tous les pays
  function getAllCountries(map) {
    const regions = map.regionsRepository.getLoaded();
    return regions.map(region => ({
      id: region.id,
      name: region.title,
      code: region.id
    }));
  }
  
  // Exporter les fonctions sous un namespace global
  window.mapSVGUtils = {
    initMapSVG,
    colorCountry,
    resetCountryColors,
    getAllCountries
  };