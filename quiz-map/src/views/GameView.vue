<template>
    <div class="game-view">
      <WorldMap />
    </div>
  </template>
  
  <script>
  import WorldMap from '@/components/map/WorldMap.vue';
  
  export default {
    name: 'GameView',
    components: {
      WorldMap
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .game-view {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    padding: 20px;
  }
  
  @media (max-width: 768px) {
    .game-view {
      padding: 10px;
    }
  }
  </style>