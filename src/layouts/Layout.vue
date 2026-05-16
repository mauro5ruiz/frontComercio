<template>
  <div class="flex h-screen overflow-hidden">
    <Sidebar />

    <main class="module-area flex-1 h-screen overflow-y-auto p-6" style="background-color: var(--module-bg-color, #f3f4f6)">
      <router-view />
    </main>
  </div>
  <Toast />
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
import Toast from '@/components/Toast.vue';
</script>
