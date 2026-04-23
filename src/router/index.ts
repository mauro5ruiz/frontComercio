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

      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router