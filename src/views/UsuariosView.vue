<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Usuarios</h1>

    <div class="bg-white rounded-xl shadow p-4 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
      <div class="md:col-span-2">
        <label class="text-sm text-gray-600">Buscar</label>
        <input v-model="search" class="w-full border px-3 py-2 rounded-md" placeholder="Nombre, apellido, usuario o email" />
      </div>
      <div class="flex items-end">
        <label class="text-sm flex items-center gap-2">
          <input type="checkbox" v-model="incluirInactivos" />
          Incluir inactivos
        </label>
      </div>
      <div class="flex items-end justify-end">
        <button @click="abrirCrear" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">+ Nuevo usuario</button>
      </div>
    </div>

    <table class="w-full bg-white rounded shadow">
      <thead>
        <tr class="text-left border-b">
          <th class="p-2">Usuario</th><th class="p-2">Nombre</th><th class="p-2">Rol</th><th class="p-2">Estado</th><th class="p-2 text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in usuariosPaginados" :key="u.id" class="border-b hover:bg-gray-50">
          <td class="p-2">{{ u.usuarioLogin }}</td>
          <td class="p-2">{{ u.nombre }} {{ u.apellido }}</td>
          <td class="p-2">{{ rolNombre(u.rolId) }}</td>
          <td class="p-2"><span :class="u.activo ? 'text-green-600' : 'text-red-600'">{{ u.activo ? "Activo" : "Inactivo" }}</span></td>
          <td class="p-2">
            <div class="flex justify-end items-center gap-2 whitespace-nowrap">
              <button @click="abrirEditar(u.id)" class="text-blue-600 cursor-pointer w-16 text-right">Editar</button>
              <button @click="abrirCambiarClave(u.id)" class="text-violet-600 cursor-pointer w-14 text-right">Clave</button>
              <button v-if="u.activo" @click="desactivar(u.id)" class="text-red-600 cursor-pointer w-20 text-right">Desactivar</button>
              <button v-else @click="activar(u.id)" class="text-emerald-600 cursor-pointer w-20 text-right">Activar</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="flex justify-center items-center gap-2 mt-4">
      <button @click="page--" :disabled="page === 1" class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">←</button>
      <span class="text-sm">Página {{ page }} de {{ totalPaginas }}</span>
      <button @click="page++" :disabled="page === totalPaginas" class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">→</button>
    </div>

    <div class="mt-4 flex justify-end">
      <button @click="openLoginModal = true" class="bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-800">Probar login (mock)</button>
    </div>

    <div v-if="openFormModal" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-xl w-full max-w-3xl shadow-xl">
        <div class="px-6 py-4 border-b bg-gray-50 rounded-t-xl"><h2 class="text-lg font-bold">{{ editandoId ? "Editar usuario" : "Nuevo usuario" }}</h2></div>
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div><label class="text-sm text-gray-700">Nombre *</label><input v-model="form.nombre" class="border px-3 py-2 rounded-md w-full" /></div>
          <div><label class="text-sm text-gray-700">Apellido *</label><input v-model="form.apellido" class="border px-3 py-2 rounded-md w-full" /></div>
          <div><label class="text-sm text-gray-700">Email *</label><input v-model="form.email" type="email" class="border px-3 py-2 rounded-md w-full" /></div>
          <div><label class="text-sm text-gray-700">Teléfono</label><input v-model="form.telefono" class="border px-3 py-2 rounded-md w-full" /></div>
          <div><label class="text-sm text-gray-700">Usuario *</label><input v-model="form.usuarioLogin" :readonly="!!editandoId" class="border px-3 py-2 rounded-md w-full" /></div>
          <div v-if="!editandoId"><label class="text-sm text-gray-700">Clave *</label><input v-model="form.clave" type="password" class="border px-3 py-2 rounded-md w-full" /><p class="text-xs text-gray-500 mt-1">Mínimo 5 caracteres, una mayúscula y un número.</p></div>
          <div><label class="text-sm text-gray-700">Rol *</label><select v-model.number="form.rolId" class="border px-3 py-2 rounded-md w-full"><option :value="0">Seleccionar rol</option>
            <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.nombre }}</option>
          </select></div>
          <label class="md:col-span-2 text-sm flex items-center gap-2"><input type="checkbox" v-model="form.debeCambiarClave" /> Debe cambiar clave en próximo login</label>
        </div>
        <div class="px-6 py-4 border-t bg-gray-50 rounded-b-xl flex justify-end gap-2">
          <button @click="cerrarFormModal" class="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">Cancelar</button>
          <button @click="guardarUsuario" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Guardar</button>
        </div>
      </div>
    </div>

    <div v-if="openClaveModal" class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 class="text-lg font-bold mb-4">Cambiar clave</h2>
        <div class="space-y-3">
          <input v-model="claveForm.claveActual" type="password" class="w-full border px-3 py-2 rounded-md" placeholder="Clave actual *" />
          <input v-model="claveForm.nuevaClave" type="password" class="w-full border px-3 py-2 rounded-md" placeholder="Nueva clave *" />
        </div>
        <div class="flex justify-end gap-2 mt-5">
          <button @click="openClaveModal = false" class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancelar</button>
          <button @click="guardarCambioClave" class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Guardar</button>
        </div>
      </div>
    </div>

    <div v-if="openLoginModal" class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 class="text-lg font-bold mb-4">Login (mock)</h2>
        <div class="space-y-3">
          <input v-model="loginForm.usuario" class="w-full border px-3 py-2 rounded-md" placeholder="Usuario" />
          <input v-model="loginForm.clave" type="password" class="w-full border px-3 py-2 rounded-md" placeholder="Clave" />
        </div>
        <div class="flex justify-end gap-2 mt-5">
          <button @click="openLoginModal = false" class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancelar</button>
          <button @click="probarLogin" class="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700">Ingresar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useNotificationStore } from "@/stores/notificaciones";
const notification = useNotificationStore();

const roles = ref([{ id: 1, nombre: "Administrador" }, { id: 2, nombre: "Cajero" }, { id: 3, nombre: "Supervisor" }]);
const usuarios = ref(Array.from({ length: 12 }, (_, i) => ({
  id: i + 1, nombre: `Nombre${i + 1}`, apellido: `Apellido${i + 1}`, email: `user${i + 1}@mail.com`, usuarioLogin: `user${i + 1}`, clave: "Abcde1", rolId: (i % 3) + 1, telefono: "11-5555-0000", activo: i % 5 !== 0, debeCambiarClave: i % 4 === 0, fechaCreacion: new Date().toISOString(), ultimoAcceso: i % 3 === 0 ? null : new Date().toISOString()
})));

const search = ref("");
const incluirInactivos = ref(false);
const openFormModal = ref(false);
const openClaveModal = ref(false);
const openLoginModal = ref(false);
const editandoId = ref<number | null>(null);
const usuarioClaveId = ref<number | null>(null);
const page = ref(1);
const pageSize = 10;

const form = ref({ nombre: "", apellido: "", email: "", usuarioLogin: "", clave: "", rolId: 0, telefono: "", debeCambiarClave: false });
const claveForm = ref({ claveActual: "", nuevaClave: "" });
const loginForm = ref({ usuario: "", clave: "" });

const usuariosFiltrados = computed(() => {
  const term = search.value.toLowerCase();
  return usuarios.value.filter(u => (incluirInactivos.value || u.activo) && (`${u.nombre} ${u.apellido} ${u.usuarioLogin} ${u.email}`).toLowerCase().includes(term));
});
const totalPaginas = computed(() => Math.max(1, Math.ceil(usuariosFiltrados.value.length / pageSize)));
const usuariosPaginados = computed(() => usuariosFiltrados.value.slice((page.value - 1) * pageSize, page.value * pageSize));

const rolNombre = (rolId: number) => roles.value.find(r => r.id === rolId)?.nombre || `Rol #${rolId}`;
const formatDateTime = (value: string | null) => value ? new Date(value).toLocaleString("es-AR") : "Nunca";
const claveSegura = (clave: string) => /^(?=.*[A-Z])(?=.*\d).{5,}$/.test(clave);
const emailValido = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const abrirCrear = () => {
  editandoId.value = null;
  form.value = { nombre: "", apellido: "", email: "", usuarioLogin: "", clave: "", rolId: 0, telefono: "", debeCambiarClave: false };
  openFormModal.value = true;
};

const abrirEditar = (id: number) => {
  const u = usuarios.value.find(x => x.id === id);
  if (!u) return;
  editandoId.value = id;
  form.value = { nombre: u.nombre, apellido: u.apellido, email: u.email, usuarioLogin: u.usuarioLogin, clave: "", rolId: u.rolId, telefono: u.telefono, debeCambiarClave: u.debeCambiarClave };
  openFormModal.value = true;
};

const cerrarFormModal = () => (openFormModal.value = false);

const guardarUsuario = () => {
  if (!form.value.nombre.trim() || !form.value.apellido.trim()) return notification.show("Nombre y apellido son obligatorios", "error");
  if (!form.value.usuarioLogin.trim()) return notification.show("El usuario es obligatorio", "error");
  if (!emailValido(form.value.email)) return notification.show("El email no tiene un formato válido", "error");
  if (!editandoId.value && !form.value.clave.trim()) return notification.show("La clave es obligatoria", "error");
  if (!editandoId.value && !claveSegura(form.value.clave)) return notification.show("La clave debe tener mínimo 5 caracteres, una mayúscula y un número", "error");
  if (form.value.rolId <= 0) return notification.show("Seleccioná un rol", "error");
  if (!editandoId.value && usuarios.value.some(u => u.usuarioLogin.toLowerCase() === form.value.usuarioLogin.toLowerCase())) return notification.show("Ya existe un usuario con ese nombre", "error");
  if (!editandoId.value && usuarios.value.some(u => u.email.toLowerCase() === form.value.email.toLowerCase())) return notification.show("Ya existe un usuario con ese email", "error");

  if (editandoId.value) {
    const u = usuarios.value.find(x => x.id === editandoId.value);
    if (!u) return;
    u.nombre = form.value.nombre; u.apellido = form.value.apellido; u.email = form.value.email; u.rolId = form.value.rolId; u.telefono = form.value.telefono; u.debeCambiarClave = form.value.debeCambiarClave;
    notification.show("Usuario actualizado correctamente (mock)", "success");
  } else {
    usuarios.value.unshift({ id: Math.max(...usuarios.value.map(x => x.id), 0) + 1, nombre: form.value.nombre, apellido: form.value.apellido, email: form.value.email, usuarioLogin: form.value.usuarioLogin, clave: form.value.clave, rolId: form.value.rolId, telefono: form.value.telefono, activo: true, debeCambiarClave: form.value.debeCambiarClave, fechaCreacion: new Date().toISOString(), ultimoAcceso: null });
    notification.show("Usuario creado correctamente (mock)", "success");
  }
  openFormModal.value = false;
};

const activar = (id: number) => { const u = usuarios.value.find(x => x.id === id); if (!u) return; u.activo = true; notification.show("Usuario activado (mock)", "success"); };
const desactivar = (id: number) => { const u = usuarios.value.find(x => x.id === id); if (!u) return; u.activo = false; notification.show("Usuario desactivado (mock)", "success"); };

const abrirCambiarClave = (id: number) => { usuarioClaveId.value = id; claveForm.value = { claveActual: "", nuevaClave: "" }; openClaveModal.value = true; };
const guardarCambioClave = () => {
  if (!usuarioClaveId.value) return;
  const u = usuarios.value.find(x => x.id === usuarioClaveId.value);
  if (!u) return;
  if (!claveForm.value.nuevaClave.trim()) return notification.show("La nueva clave es obligatoria", "error");
  if (!claveSegura(claveForm.value.nuevaClave)) return notification.show("La clave debe tener mínimo 5 caracteres, una mayúscula y un número", "error");
  if (u.clave !== claveForm.value.claveActual) return notification.show("La clave actual es incorrecta", "error");
  u.clave = claveForm.value.nuevaClave; u.debeCambiarClave = false;
  openClaveModal.value = false;
  notification.show("Clave actualizada correctamente (mock)", "success");
};

const probarLogin = () => {
  const u = usuarios.value.find(x => x.usuarioLogin.toLowerCase() === loginForm.value.usuario.toLowerCase());
  if (!u || !u.activo || u.clave !== loginForm.value.clave) return notification.show("Usuario o contraseña incorrectos", "error");
  u.ultimoAcceso = new Date().toISOString();
  openLoginModal.value = false;
  notification.show(`Login correcto (mock): ${u.nombre} ${u.apellido}`, "success");
};

watch([search, incluirInactivos], () => {
  page.value = 1;
});
</script>
