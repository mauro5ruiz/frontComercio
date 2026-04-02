<template>
  <div
    v-if="notification.visible"
    class="fixed top-5 right-5 z-50 px-4 py-3 rounded shadow-lg text-white transition"
    :class="colorClass"
  >
    {{ notification.message }}
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useNotificationStore } from "@/stores/notificaciones";

const notification = useNotificationStore();

const colorClass = computed(() => {
  return {
    "bg-green-500": notification.type === "success",
    "bg-red-500": notification.type === "error",
    "bg-blue-500": notification.type === "info"
  };
});
</script>