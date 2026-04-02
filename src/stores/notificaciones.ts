import { defineStore } from "pinia";
import { ref } from "vue";

export const useNotificationStore = defineStore("notification", () => {
  const message = ref("");
  const type = ref<"success" | "error" | "info">("info");
  const visible = ref(false);

  const show = (msg: string, t: "success" | "error" | "info" = "info") => {
    message.value = msg;
    type.value = t;
    visible.value = true;

    setTimeout(() => {
      visible.value = false;
    }, 3000);
  };

  return {
    message,
    type,
    visible,
    show
  };
});