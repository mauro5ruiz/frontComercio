<template>
  <div class="flex">
    <Sidebar />

    <main class="flex-1 bg-gray-100 min-h-screen p-6">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
</script>