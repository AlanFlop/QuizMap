<template>
    <div class="dashboard-view">
      <DashboardComponent />
    </div>
  </template>
  
  <script>
  import DashboardComponent from '@/components/dashboard/DashboardComponent.vue';
  
  export default {
    name: 'DashboardView',
    components: {
      DashboardComponent
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .dashboard-view {
    background-color: #f5f7fa;
  }
  </style>