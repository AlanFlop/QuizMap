import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import './assets/styles/main.scss'
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

// Configuration d'axios
axios.defaults.baseURL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api';

// Intercepteur pour ajouter le token d'authentification
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const app = createApp(App);

// Options pour Toast
const options = {
  // Vous pouvez personnaliser vos options ici
};

app.use(Toast, options);
app.use(router)
   .use(store)
   .mount('#app');