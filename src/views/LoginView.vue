<template>
  <div class="login-bg min-h-screen flex items-center justify-center p-6">
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="blob blob-a"></div>
      <div class="blob blob-b"></div>
      <div class="blob blob-c"></div>
    </div>

    <div class="relative w-full max-w-md">
      <div class="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 border border-white/40">
        <div class="text-center mb-7">
          <h1 class="text-3xl font-extrabold text-slate-900">LoboStock</h1>
          <p class="text-sm text-slate-500 mt-1">Ingresá para acceder al sistema</p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="text-sm text-slate-700 font-medium">Usuario</label>
            <input
              v-model="usuario"
              class="w-full mt-1 border border-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Ej: admin"
              @keyup.enter="login"
            />
          </div>
          <div>
            <label class="text-sm text-slate-700 font-medium">Contraseña</label>
            <input
              v-model="clave"
              type="password"
              class="w-full mt-1 border border-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Ingresá tu contraseña"
              @keyup.enter="login"
            />
          </div>
        </div>

        <button @click="login" class="w-full mt-6 bg-cyan-600 text-white py-2.5 rounded-lg font-semibold hover:bg-cyan-700 transition cursor-pointer">
          Ingresar
        </button>

        <p v-if="errorCredenciales" class="mt-3 text-sm text-red-600 font-medium">
          Las credenciales son incorrectas.
        </p>

        <div class="mt-6 text-xs text-slate-500 bg-slate-100 rounded-lg p-3">
          <p class="font-semibold text-slate-700 mb-1">Credenciales mock</p>
          <p><b>Usuario:</b> admin</p>
          <p><b>Contraseña:</b> Admin1</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const usuario = ref("");
const clave = ref("");
const errorCredenciales = ref(false);

const login = () => {
  errorCredenciales.value = false;
  const credencialesValidas = usuario.value.trim().toLowerCase() === "admin" && clave.value === "Admin1";

  if (!credencialesValidas) {
    errorCredenciales.value = true;
    return;
  }

  localStorage.setItem("mock_auth", "1");
  localStorage.setItem("mock_user", JSON.stringify({ usuario: "admin", nombre: "Administrador" }));
  router.push("/dashboard");
};
</script>

<style scoped>
.login-bg {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 20% 20%, #1e3a8a 0%, transparent 40%),
    radial-gradient(circle at 80% 70%, #0f766e 0%, transparent 45%),
    linear-gradient(135deg, #020617 0%, #0f172a 50%, #111827 100%);
}

.blob {
  position: absolute;
  border-radius: 9999px;
  filter: blur(60px);
  opacity: 0.5;
  animation: drift 16s ease-in-out infinite;
}

.blob-a {
  width: 320px;
  height: 320px;
  top: -80px;
  left: -60px;
  background: #22d3ee;
}

.blob-b {
  width: 380px;
  height: 380px;
  right: -80px;
  bottom: -120px;
  background: #2563eb;
  animation-delay: 2s;
}

.blob-c {
  width: 240px;
  height: 240px;
  top: 35%;
  left: 55%;
  background: #14b8a6;
  animation-delay: 4s;
}

@keyframes drift {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  25% { transform: translate3d(18px, -14px, 0) scale(1.04); }
  50% { transform: translate3d(-10px, 16px, 0) scale(0.98); }
  75% { transform: translate3d(12px, 10px, 0) scale(1.03); }
  100% { transform: translate3d(0, 0, 0) scale(1); }
}
</style>
