<template>
  <aside class="w-64 h-screen bg-gray-900 text-gray-200 flex flex-col">
    
    <!-- LOGO -->
    <div class="p-4 text-lg font-bold border-b border-gray-700">
      Mi Sistema
    </div>

    <!-- MENU -->
    <nav class="flex-1 p-3 space-y-2">

      <!-- Dashboard -->
      <router-link
        to="/"
        class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800"
        :class="isActive('/') ? 'bg-gray-800 text-white' : ''"
      >
        📊 <span>Dashboard</span>
      </router-link>

      <!-- E-commerce dropdown -->
      <div>
        <button
          @click="openMenu = !openMenu"
          class="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-800"
        >
          <span class="flex items-center gap-3">
            🛒 E-commerce
          </span>
          <span :class="openMenu ? 'rotate-180' : ''">⌄</span>
        </button>

        <div v-show="openMenu" class="ml-6 mt-2 space-y-1">
          <router-link
            to="/productos"
            class="block px-3 py-2 rounded-md hover:bg-gray-800"
            :class="isActive('/productos') ? 'bg-gray-800 text-white' : ''"
          >
            Productos
          </router-link>

          <router-link
            to="/categorias"
            class="block px-3 py-2 rounded-md hover:bg-gray-800"
            :class="isActive('/categorias') ? 'bg-gray-800 text-white' : ''"
          >
            Categorías
          </router-link>
        </div>
      </div>

      <!-- Otros -->
      <router-link to="/usuarios" class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800">
        👤 Usuarios
      </router-link>

      <router-link to="/pedidos" class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800">
        📦 Pedidos
      </router-link>

    </nav>

    <!-- FOOTER -->
    <div class="p-4 border-t border-gray-700 text-sm text-gray-400">
      © {{ añoActual }}
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const openMenu = ref(false)

const isActive = (path) => route.path === path
const añoActual = new Date().getFullYear();
</script>