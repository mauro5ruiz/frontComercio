<template>
  <aside class="w-64 h-screen flex flex-col" :style="{ backgroundColor: prefs.menuColor, color: prefs.menuTextColor, '--menu-hover-color': prefs.menuHoverColor }">
    <div class="p-4 text-lg font-bold border-b border-gray-700 flex items-center gap-2">
      <img v-if="prefs.logoDataUrl" :src="prefs.logoDataUrl" alt="Logo" class="h-9 w-9 object-contain rounded" />
      <span v-else class="text-yellow-400">🐕</span>
      <span class="truncate">{{ prefs.appTitle }}</span>
    </div>

    <nav class="flex-1 p-3 space-y-2 overflow-y-auto">
      <router-link to="/dashboard" class="menu-item flex items-center gap-3 px-3 py-2 rounded-lg" :class="isActive('/dashboard') ? 'menu-item-active text-white' : ''">Dashboard</router-link>

      <div>
        <button @click="toggleMenu('productos')" class="menu-item w-full flex items-center justify-between px-3 py-2 rounded-lg"><span>Productos / Stock</span><span :class="openMenus.productos ? 'rotate-180' : ''">⌄</span></button>
        <div v-show="openMenus.productos" class="ml-5 mt-2 space-y-1">
          <router-link to="/productos" class="menu-item block px-3 py-2 rounded-md">Productos</router-link>
          <router-link to="/categorias" class="menu-item block px-3 py-2 rounded-md">Categorias</router-link>
          <router-link to="/marcas" class="menu-item block px-3 py-2 rounded-md">Marcas</router-link>
          <router-link to="/kardex" class="menu-item block px-3 py-2 rounded-md">Kardex</router-link>
          <router-link to="/ofertas" class="menu-item block px-3 py-2 rounded-md">Ofertas</router-link>
          <router-link to="/perdidas" class="menu-item block px-3 py-2 rounded-md">Perdidas</router-link>
        </div>
      </div>

      <div>
        <button @click="toggleMenu('ventas')" class="menu-item w-full flex items-center justify-between px-3 py-2 rounded-lg"><span>Ventas</span><span :class="openMenus.ventas ? 'rotate-180' : ''">⌄</span></button>
        <div v-show="openMenus.ventas" class="ml-5 mt-2 space-y-1">
          <router-link to="/ventas" class="menu-item block px-3 py-2 rounded-md">Ventas</router-link>
          <router-link to="/devoluciones-ventas" class="menu-item block px-3 py-2 rounded-md">Devoluciones</router-link>
          <router-link to="/formas-de-pago" class="menu-item block px-3 py-2 rounded-md">Formas de Pago</router-link>
        </div>
      </div>

      <div>
        <button @click="toggleMenu('compras')" class="menu-item w-full flex items-center justify-between px-3 py-2 rounded-lg"><span>Compras</span><span :class="openMenus.compras ? 'rotate-180' : ''">⌄</span></button>
        <div v-show="openMenus.compras" class="ml-5 mt-2 space-y-1">
          <router-link to="/compras" class="menu-item block px-3 py-2 rounded-md">Compras</router-link>
          <router-link to="/devoluciones-compras" class="menu-item block px-3 py-2 rounded-md">Devoluciones</router-link>
        </div>
      </div>

      <div>
        <button @click="toggleMenu('personas')" class="menu-item w-full flex items-center justify-between px-3 py-2 rounded-lg"><span>Personas</span><span :class="openMenus.personas ? 'rotate-180' : ''">⌄</span></button>
        <div v-show="openMenus.personas" class="ml-5 mt-2 space-y-1">
          <router-link to="/clientes" class="menu-item block px-3 py-2 rounded-md">Clientes</router-link>
          <router-link to="/proveedores" class="menu-item block px-3 py-2 rounded-md">Proveedores</router-link>
          <router-link to="/vendedores" class="menu-item block px-3 py-2 rounded-md">Vendedores</router-link>
          <router-link to="/usuarios" class="menu-item block px-3 py-2 rounded-md">Usuarios</router-link>
        </div>
      </div>
    </nav>

    <div class="p-3 border-t border-gray-700 space-y-2">
      <button @click="openPrefs = true" class="menu-item w-full flex items-center gap-2 px-3 py-2 rounded-lg transition">Preferencias</button>
      <button @click="logout" class="menu-item w-full flex items-center gap-2 px-3 py-2 rounded-lg transition">Cerrar sesion</button>
    </div>

    <div class="p-3 text-xs text-gray-400 text-center">© {{ anoActual }}</div>

    <div v-if="openPrefs" class="fixed inset-0 z-[70] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-5 text-gray-800">
        <h2 class="text-lg font-bold mb-4">Preferencias</h2>

        <div class="space-y-3">
          <div>
            <label class="text-sm font-medium">Nombre del sistema</label>
            <input v-model="draft.appTitle" type="text" maxlength="40" class="w-full mt-1 border rounded px-3 py-2" placeholder="Ej: Mi Comercio" />
          </div>

          <div>
            <label class="text-sm font-medium">Logo</label>
            <input type="file" accept="image/*" class="w-full mt-1 border rounded px-3 py-2" @change="onSelectLogo" />
            <p class="text-xs text-gray-500 mt-1">Se aplica en la parte superior del menu.</p>
          </div>

          <div>
            <label class="text-sm font-medium">Color del menu</label>
            <input v-model="draft.menuColor" type="color" class="w-full h-10 mt-1 border rounded p-1" />
          </div>

          <div>
            <label class="text-sm font-medium">Color del texto del menu</label>
            <input v-model="draft.menuTextColor" type="color" class="w-full h-10 mt-1 border rounded p-1" />
          </div>

          <div>
            <label class="text-sm font-medium">Color hover/seleccion menu</label>
            <input v-model="draft.menuHoverColor" type="color" class="w-full h-10 mt-1 border rounded p-1" />
          </div>

          <div>
            <label class="text-sm font-medium">Color de fondo de modulos</label>
            <input v-model="draft.moduleColor" type="color" class="w-full h-10 mt-1 border rounded p-1" />
          </div>
        </div>

        <div class="mt-5 flex justify-end gap-2">
          <button @click="restablecer" class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Restablecer diseño inicial</button>
          <button @click="openPrefs = false" class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancelar</button>
          <button @click="guardarPrefs" class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Guardar</button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const PREFS_KEY = "ui_prefs";
const defaults = { appTitle: "LoboStock", menuColor: "#111827", menuTextColor: "#e5e7eb", menuHoverColor: "#1f2937", moduleColor: "#f8fafc", logoDataUrl: "" };

const openMenus = ref({ productos: false, ventas: false, compras: false, personas: false });
const openPrefs = ref(false);
const prefs = ref({ ...defaults });
const draft = ref({ appTitle: defaults.appTitle, menuColor: defaults.menuColor, menuTextColor: defaults.menuTextColor, menuHoverColor: defaults.menuHoverColor, moduleColor: defaults.moduleColor, logoDataUrl: "" });

const toggleMenu = (menu) => { openMenus.value[menu] = !openMenus.value[menu]; };
const isActive = (path) => route.path === path;
const anoActual = new Date().getFullYear();

const aplicarEnSistema = (cfg) => {
  document.documentElement.style.setProperty("--module-bg-color", cfg.moduleColor || defaults.moduleColor);
};

const cargarPrefs = () => {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    prefs.value = { ...defaults, ...parsed };
    draft.value = { ...prefs.value };
    aplicarEnSistema(prefs.value);
  } catch {
    prefs.value = { ...defaults };
    draft.value = { ...defaults };
    aplicarEnSistema(defaults);
  }
};

const guardarPrefs = () => {
  if (!draft.value.appTitle.trim()) {
    draft.value.appTitle = defaults.appTitle;
  }
  prefs.value = { ...draft.value };
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs.value));
  aplicarEnSistema(prefs.value);
  openPrefs.value = false;
};

const restablecer = () => {
  prefs.value = { ...defaults };
  draft.value = { ...defaults };
  localStorage.setItem(PREFS_KEY, JSON.stringify(defaults));
  aplicarEnSistema(defaults);
};

const onSelectLogo = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    draft.value.logoDataUrl = String(reader.result || "");
  };
  reader.readAsDataURL(file);
};

const logout = () => {
  localStorage.removeItem("mock_auth");
  localStorage.removeItem("mock_user");
  router.push("/login");
};

onMounted(() => {
  cargarPrefs();
  aplicarEnSistema(prefs.value);
});
</script>

<style scoped>
.menu-item:hover {
  background-color: var(--menu-hover-color);
}

.menu-item-active {
  background-color: var(--menu-hover-color);
}
</style>
