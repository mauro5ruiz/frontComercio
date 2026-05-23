import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '@/modules/auth/session'

const routes = [
  {
    path: '/login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/',
    component: () => import('@/layouts/Layout.vue'),
    children: [
      {
        path: "",
        redirect: "/dashboard"
      },
      {
        path: 'categorias',
        component: () => import('@/views/CategoriasView.vue')
      },
      {
        path: "formas-de-pago",
        component: () => import('@/views/FormasDePagosView.vue')
      },
      {
        path: "marcas",
        component: () => import('@/views/MarcasView.vue')
      },
      {
        path: "proveedores",
        component: () => import('@/views/ProveedoresView.vue')
      },
      {
        path: "clientes",
        component: () => import('@/views/ClientesView.vue')
      },
      {
        path: "productos",
        component: () => import('@/views/ProductosView.vue')
      },
      {
        path: "ofertas",
        component: () => import('@/views/OfertasView.vue')
      },
      {
        path: "vendedores",
        component: () => import('@/views/VendedoresView.vue')
      },
      {
        path: "dashboard",
        component: () => import('@/views/DashboardView.vue')
      },
      {
        path: "perdidas",
        component: () => import('@/views/PerdidasView.vue')
      },
      {
        path: "ajustes-stock",
        component: () => import('@/views/AjustarStockView.vue')
      },
      {
        path: "kardex",
        component: () => import('@/views/KardexView.vue')
      },
      {
        path: "compras",
        component: () => import('@/views/ComprasView.vue')
      },
      {
        path: "ventas",
        component: () => import('@/views/VentasView.vue')
      },
      {
        path: "devoluciones-ventas",
        component: () => import('@/views/DevolucionesVentasView.vue')
      },
      {
        path: "devoluciones-compras",
        component: () => import('@/views/DevolucionesComprasView.vue')
      },
      {
        path: "usuarios",
        component: () => import('@/views/UsuariosView.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, _from, next) => {
  const isAuth = isAuthenticated();

  if (to.path === "/login" && isAuth) {
    next("/dashboard");
    return;
  }

  if (to.path !== "/login" && !isAuth) {
    next("/login");
    return;
  }

  next();
});

export default router
