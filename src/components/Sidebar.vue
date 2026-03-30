<template>
  <aside class="w-64 h-screen bg-gray-900 text-gray-200 flex flex-col">

    <!-- LOGO -->
    <div class="p-4 text-lg font-bold border-b border-gray-700 flex items-center gap-2">
      <span class="text-yellow-400">🐕</span>
      <span>LoboStock</span>
    </div>

    <!-- MENU -->
    <nav class="flex-1 p-3 space-y-2 overflow-y-auto">

      <!-- Dashboard -->
      <router-link
        to="/"
        class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800"
        :class="isActive('/') ? 'bg-gray-800 text-white' : ''"
      >
        📊 Dashboard
      </router-link>

      <!-- PRODUCTOS -->
      <div>
        <button
          @click="toggleMenu('productos')"
          class="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-800"
        >
          <span>📦 Productos / Stock</span>
          <span :class="openMenus.productos ? 'rotate-180' : ''">⌄</span>
        </button>

        <div v-show="openMenus.productos" class="ml-5 mt-2 space-y-1">
          <router-link to="/productos" class="block px-3 py-2 rounded-md hover:bg-gray-800" :class="isActive('/productos') && 'bg-gray-800 text-white'">Productos</router-link>
          <router-link to="/categorias" class="block px-3 py-2 rounded-md hover:bg-gray-800" :class="isActive('/categorias') && 'bg-gray-800 text-white'">Categorías</router-link>
          <router-link to="/marcas" class="block px-3 py-2 rounded-md hover:bg-gray-800">Marcas</router-link>
          <router-link to="/kardex" class="block px-3 py-2 rounded-md hover:bg-gray-800">Kardex</router-link>
          <router-link to="/ofertas" class="block px-3 py-2 rounded-md hover:bg-gray-800">Ofertas</router-link>
          <router-link to="/perdidas" class="block px-3 py-2 rounded-md hover:bg-gray-800">Pérdidas</router-link>
        </div>
      </div>

      <!-- VENTAS -->
      <div>
        <button
          @click="toggleMenu('ventas')"
          class="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-800"
        >
          <span>💰 Ventas</span>
          <span :class="openMenus.ventas ? 'rotate-180' : ''">⌄</span>
        </button>

        <div v-show="openMenus.ventas" class="ml-5 mt-2 space-y-1">
          <router-link to="/ventas" class="block px-3 py-2 rounded-md hover:bg-gray-800">Ventas</router-link>
          <router-link to="/devoluciones-ventas" class="block px-3 py-2 rounded-md hover:bg-gray-800">Devoluciones</router-link>
          <router-link to="/formas-pago" class="block px-3 py-2 rounded-md hover:bg-gray-800">Formas de Pago</router-link>
        </div>
      </div>

      <!-- COMPRAS -->
      <div>
        <button
          @click="toggleMenu('compras')"
          class="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-800"
        >
          <span>🛒 Compras</span>
          <span :class="openMenus.compras ? 'rotate-180' : ''">⌄</span>
        </button>

        <div v-show="openMenus.compras" class="ml-5 mt-2 space-y-1">
          <router-link to="/compras" class="block px-3 py-2 rounded-md hover:bg-gray-800">Compras</router-link>
          <router-link to="/devoluciones-compras" class="block px-3 py-2 rounded-md hover:bg-gray-800">Devoluciones</router-link>
        </div>
      </div>

      <!-- PERSONAS -->
      <div>
        <button
          @click="toggleMenu('personas')"
          class="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-800"
        >
          <span>👥 Personas</span>
          <span :class="openMenus.personas ? 'rotate-180' : ''">⌄</span>
        </button>

        <div v-show="openMenus.personas" class="ml-5 mt-2 space-y-1">
          <router-link to="/clientes" class="block px-3 py-2 rounded-md hover:bg-gray-800">Clientes</router-link>
          <router-link to="/proveedores" class="block px-3 py-2 rounded-md hover:bg-gray-800">Proveedores</router-link>
          <router-link to="/vendedores" class="block px-3 py-2 rounded-md hover:bg-gray-800">Vendedores</router-link>
          <router-link to="/usuarios" class="block px-3 py-2 rounded-md hover:bg-gray-800">Usuarios</router-link>
        </div>
      </div>

      <!-- CONFIG -->
      <div>
        <button
          @click="toggleMenu('config')"
          class="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-800"
        >
          <span>⚙️ Configuración</span>
          <span :class="openMenus.config ? 'rotate-180' : ''">⌄</span>
        </button>

        <div v-show="openMenus.config" class="ml-5 mt-2 space-y-1">
          <router-link to="/sucursales" class="block px-3 py-2 rounded-md hover:bg-gray-800">Sucursales</router-link>
          <router-link to="/ajustes-stock" class="block px-3 py-2 rounded-md hover:bg-gray-800">Ajustes Stock</router-link>
        </div>
      </div>

    </nav>

    <!-- LOGOUT -->
    <div class="p-3 border-t border-gray-700">
      <button
        @click="logout"
        class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition"
      >
        🚪 Cerrar sesión
      </button>
    </div>

    <!-- FOOTER -->
    <div class="p-3 text-xs text-gray-400 text-center">
      © {{ añoActual }}
    </div>

  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const openMenus = ref({
  productos: false,
  ventas: false,
  compras: false,
  personas: false,
  config: false
})

const toggleMenu = (menu) => {
  openMenus.value[menu] = !openMenus.value[menu]
}

const isActive = (path) => route.path === path

const logout = () => {
  localStorage.clear()
  router.push('/login')
}

const añoActual = new Date().getFullYear()
</script>