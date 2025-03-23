import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'
import HomeView from '@/views/HomeView.vue'
// Ajoutez cette ligne d'import
import AuthService from '@/services/auth.service'


const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/play',
    name: 'game',
    component: () => import('@/views/GameView.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/LoginView.vue'),
    props: { isLogin: false }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/leaderboard',
    name: 'leaderboard',
    component: () => import('@/views/LeaderboardView.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reset-password',
    name: 'resetPassword',
    component: () => import('@/views/ResetPasswordView.vue')
  },
  {
    path: '/quiz',
    name: 'quiz',
    component: () => import('@/views/QuizView.vue')
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/admin/AdminView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/create-quiz',
    name: 'createQuiz',
    component: () => import('@/views/admin/CreateQuizView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: () => import('@/views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Le middleware fonctionne maintenant car AuthService est importé
router.beforeEach((to, from, next) => {
  // Vérifier si la route nécessite une authentification
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Vérifier si l'utilisateur est connecté
    if (!AuthService.isAuthenticated()) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    } else {
      // Vérifier si la route nécessite des droits d'admin
      if (to.matched.some(record => record.meta.requiresAdmin)) {
        if (AuthService.isAdmin()) {
          next();
        } else {
          next({ path: '/' }); // Rediriger vers la page d'accueil si non admin
        }
      } else {
        next();
      }
    }
  } else {
    next();
  }
});

export default router