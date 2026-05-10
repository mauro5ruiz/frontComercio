import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/Layout.vue'),
    children: [
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
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
