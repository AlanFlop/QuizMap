// Fonction pour initialiser MapSVG
function initMapSVG(containerId, svgPath) {
  if (window.jQuery && window.jQuery.fn.mapSvg) {
    return window.jQuery("#" + containerId).mapSvg({
      source: svgPath,
      loadingText: "Chargement de la carte...",
      colors: {
        baseDefault: "#d3d3d3",
        background: "transparent",
        selected: "#4CAF50",
        hover: "#e0e0e0"
      },
      zoom: {
        on: true,
        limit: [0, 10]
      }
    });
  } else if (typeof mapsvg !== 'undefined' && typeof mapsvg.map === 'function') {
    return new mapsvg.map(containerId, {
      options: {
        source: svgPath,
        loadingText: "Chargement de la carte..."
      }
    });
  }
  console.warn("MapSVG not available");
  return null;
}

// Exposer les fonctions au scope global
window.mapSVGUtils = {
  initMapSVG: initMapSVG
};
