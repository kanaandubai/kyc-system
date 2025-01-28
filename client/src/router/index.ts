// router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useKYCStore } from '../stores/kyc';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: { guest: true }
  },
  {
    path: '/',
    component: () => import('../layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
        meta: { requiresAuth: true, requiresAdmin: true }

      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/DashboardView.vue'),
        meta: { requiresKYC: true }
      },
      {
        path: 'kyc',
        name: 'KYC',
        component: () => import('../views/KYCSubmissionView.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'admin/kyc',
        name: 'AdminKYC',
        component: () => import('../views/AdminKYCView.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const kycStore = useKYCStore();

  // Initialize auth state if needed
  if (!authStore.initialized) {
    try {
      await authStore.checkAuth();
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  }

  // Handle guest routes (login, register)
  if (to.matched.some(record => record.meta.guest)) {
    if (authStore.user) {
      next('/dashboard');
    } else {
      next();
    }
    return;
  }

  // Check if user is authenticated
  if (!authStore.user) {
    next('/login');
    return;
  }

  // Handle admin routes
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (authStore.user.role !== 'ADMIN') {
      next('/dashboard');
      return;
    }
  }

  // Check KYC status for protected routes
  if (to.matched.some(record => record.meta.requiresKYC)) {
    if (!kycStore.initialized) {
      try {
        await kycStore.getUserKYC();
      } catch (error) {
        console.error('Failed to fetch KYC status:', error);
      }
    }

    // If user is not admin and either has no KYC or KYC is not approved
    if (
      authStore.user.role !== 'ADMIN' && 
      (!kycStore.userKYC || kycStore.userKYC.status !== 'APPROVED')
    ) {
      next('/kyc');
      return;
    }
  }

  next();
});

export default router;