<template>
  <div class="flex h-screen overflow-hidden">
    <Sidebar />

    <main class="flex-1 bg-gray-100 h-screen overflow-y-auto p-6">
      <router-view />
    </main>
  </div>
  <Toast />
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
import Toast from '@/components/Toast.vue';
</script>
