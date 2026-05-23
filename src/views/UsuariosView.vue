<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Usuarios</h1>

    <div class="bg-white rounded-xl shadow p-4 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
      <div class="md:col-span-2">
        <label class="text-sm text-gray-600">Buscar</label>
        <input v-model="search" class="w-full border px-3 py-2 rounded-md" placeholder="Nombre, usuario o email" />
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
          <th class="p-2">Usuario</th>
          <th class="p-2">Nombre</th>
          <th class="p-2">Email</th>
          <th class="p-2">Rol</th>
          <th class="p-2">Estado</th>
          <th class="p-2 text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in usuariosPaginados" :key="u.id" class="border-b hover:bg-gray-50">
          <td class="p-2">{{ u.usuarioLogin }}</td>
          <td class="p-2">{{ u.nombreCompleto }}</td>
          <td class="p-2">{{ u.email }}</td>
          <td class="p-2">{{ u.rol }}</td>
          <td class="p-2"><span :class="u.activo ? 'text-green-600' : 'text-red-600'">{{ u.activo ? "Activo" : "Inactivo" }}</span></td>
          <td class="p-2">
            <div class="flex justify-end items-center gap-2 whitespace-nowrap">
              <button @click="abrirEditar(u)" class="text-blue-600 cursor-pointer w-16 text-right">Editar</button>
              <button @click="abrirCambiarClave(u.id)" class="text-violet-600 cursor-pointer w-14 text-right">Clave</button>
              <button v-if="u.activo" @click="desactivar(u.id)" class="text-red-600 cursor-pointer w-20 text-right">Desactivar</button>
              <button v-else @click="activar(u.id)" class="text-emerald-600 cursor-pointer w-20 text-right">Activar</button>
            </div>
          </td>
        </tr>

        <tr v-if="!loading && !usuariosFiltrados.length">
          <td colspan="6" class="text-center py-4 text-gray-400">No hay usuarios</td>
        </tr>

        <tr v-if="loading">
          <td colspan="6" class="text-center py-4 text-gray-400">Cargando usuarios...</td>
        </tr>
      </tbody>
    </table>

    <div class="flex justify-center items-center gap-2 mt-4">
      <button @click="page--" :disabled="page === 1" class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">←</button>
      <span class="text-sm">Pagina {{ page }} de {{ totalPaginas }}</span>
      <button @click="page++" :disabled="page === totalPaginas" class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">→</button>
    </div>

    <div class="mt-4 flex justify-end">
      <button @click="openLoginModal = true" class="bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-800">Probar login</button>
    </div>

    <div v-if="openFormModal" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-xl w-full max-w-3xl shadow-xl">
        <div class="px-6 py-4 border-b bg-gray-50 rounded-t-xl"><h2 class="text-lg font-bold">{{ editandoId ? "Editar usuario" : "Nuevo usuario" }}</h2></div>
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div><label class="text-sm text-gray-700">Nombre *</label><input v-model="form.nombre" class="border px-3 py-2 rounded-md w-full" /></div>
          <div><label class="text-sm text-gray-700">Apellido *</label><input v-model="form.apellido" class="border px-3 py-2 rounded-md w-full" /></div>
          <div><label class="text-sm text-gray-700">Email *</label><input v-model="form.email" type="email" class="border px-3 py-2 rounded-md w-full" /></div>
          <div><label class="text-sm text-gray-700">Telefono</label><input v-model="form.telefono" class="border px-3 py-2 rounded-md w-full" /></div>
          <div><label class="text-sm text-gray-700">Usuario *</label><input v-model="form.usuarioLogin" class="border px-3 py-2 rounded-md w-full" /></div>
          <div>
            <label class="text-sm text-gray-700">Clave *</label>
            <input v-model="form.clave" type="password" class="border px-3 py-2 rounded-md w-full" />
            <p class="text-xs text-gray-500 mt-1">
              {{ editandoId ? "Si deja este campo vacío, se mantendrá la clave actual." : "Minimo 6 caracteres." }}
            </p>
          </div>
          <div><label class="text-sm text-gray-700">Rol *</label><select v-model.number="form.rolId" class="border px-3 py-2 rounded-md w-full"><option :value="0">Seleccionar rol</option>
            <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.nombre }}</option>
          </select></div>
          <label class="text-sm flex items-center gap-2"><input type="checkbox" v-model="form.debeCambiarClave" /> Debe cambiar clave en proximo login</label>
          <label class="text-sm flex items-center gap-2"><input type="checkbox" v-model="form.activo" /> Activo</label>
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
        <h2 class="text-lg font-bold mb-4">Login</h2>
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
import { computed, onMounted, ref, watch } from "vue";
import { useNotificationStore } from "@/stores/notificaciones";
import {
  activarUsuario,
  actualizarUsuario,
  cambiarClaveUsuario,
  crearUsuario,
  desactivarUsuario,
  loginUsuario,
  obtenerUsuarioPorId,
  obtenerUsuarios
} from "@/modules/usuarios/services";
import type { UsuarioDto } from "@/modules/usuarios/types";

const notification = useNotificationStore();

const roles = ref([{ id: 1, nombre: "Administrador" }, { id: 2, nombre: "Cajero" }, { id: 3, nombre: "Supervisor" }]);
const usuarios = ref<UsuarioDto[]>([]);

const search = ref("");
const incluirInactivos = ref(false);
const openFormModal = ref(false);
const openClaveModal = ref(false);
const openLoginModal = ref(false);
const editandoId = ref<number | null>(null);
const usuarioClaveId = ref<number | null>(null);
const page = ref(1);
const pageSize = 10;
const loading = ref(false);

const form = ref({
  nombre: "",
  apellido: "",
  email: "",
  usuarioLogin: "",
  clave: "",
  rolId: 0,
  telefono: "",
  debeCambiarClave: false,
  activo: true
});
const claveForm = ref({ claveActual: "", nuevaClave: "" });
const loginForm = ref({ usuario: "", clave: "" });

const usuariosFiltrados = computed(() => {
  const term = search.value.toLowerCase();
  return usuarios.value.filter((u) => {
    const coincideEstado = incluirInactivos.value || u.activo;
    const coincideTexto = `${u.nombreCompleto} ${u.usuarioLogin} ${u.email}`.toLowerCase().includes(term);
    return coincideEstado && coincideTexto;
  });
});
const totalPaginas = computed(() => Math.max(1, Math.ceil(usuariosFiltrados.value.length / pageSize)));
const usuariosPaginados = computed(() => usuariosFiltrados.value.slice((page.value - 1) * pageSize, page.value * pageSize));

const claveSegura = (clave: string) => /^.{6,}$/.test(clave);
const emailValido = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const extraerMensajeError = (err: any, fallback: string) => {
  const data = err?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.error) return data.error;
  if (data?.Error) return data.Error;
  if (data?.errors && typeof data.errors === "object") {
    const mensajes = Object.values(data.errors)
      .flat()
      .filter((x) => typeof x === "string");
    if (mensajes.length) return mensajes.join(" ");
  }
  if (data?.title) return data.title;
  return fallback;
};
const nombreRolDesdeId = (rolId: number) => {
  switch (rolId) {
    case 1:
      return "Administrador";
    case 2:
      return "Cajero";
    case 3:
      return "Supervisor";
    default:
      return "";
  }
};

const normalizarUsuario = (raw: any): UsuarioDto => {
  const rolId = Number(raw?.rolId ?? raw?.RolId ?? raw?.idRol ?? raw?.IdRol ?? 0);
  const rolNombre = String(raw?.rol ?? raw?.Rol ?? raw?.rolNombre ?? raw?.RolNombre ?? "").trim();

  return {
    id: Number(raw?.id ?? raw?.Id ?? 0),
    nombreCompleto: String(raw?.nombreCompleto ?? raw?.NombreCompleto ?? ""),
    email: String(raw?.email ?? raw?.Email ?? ""),
    usuarioLogin: String(raw?.usuarioLogin ?? raw?.UsuarioLogin ?? ""),
    rolId,
    rol: rolNombre || nombreRolDesdeId(rolId),
    sucursal: raw?.sucursal ?? raw?.Sucursal ?? null,
    activo: Boolean(raw?.activo ?? raw?.Activo ?? false),
    fechaCreacion: String(raw?.fechaCreacion ?? raw?.FechaCreacion ?? ""),
    ultimoAcceso: raw?.ultimoAcceso ?? raw?.UltimoAcceso ?? null
  };
};

const rolIdDesdeTexto = (rol: string) => {
  const normalizado = rol.trim().toLowerCase();
  if (normalizado.includes("admin")) return 1;
  if (normalizado.includes("caj")) return 2;
  if (normalizado.includes("super")) return 3;
  return 0;
};

const separarNombreCompleto = (nombreCompleto: string) => {
  const partes = nombreCompleto.trim().split(/\s+/);
  if (partes.length <= 1) return { nombre: nombreCompleto.trim(), apellido: "" };
  return {
    nombre: partes.slice(0, -1).join(" "),
    apellido: partes.slice(-1).join(" ")
  };
};

const cargarUsuarios = async () => {
  loading.value = true;
  try {
    const response = await obtenerUsuarios(incluirInactivos.value);
    usuarios.value = response.map(normalizarUsuario);
  } catch (err: any) {
    notification.show(err.response?.data?.error || err.response?.data?.Error || "No se pudieron cargar los usuarios", "error");
  } finally {
    loading.value = false;
  }
};

const abrirCrear = () => {
  editandoId.value = null;
  form.value = { nombre: "", apellido: "", email: "", usuarioLogin: "", clave: "", rolId: 0, telefono: "", debeCambiarClave: false, activo: true };
  openFormModal.value = true;
};

const abrirEditar = async (usuarioBase: UsuarioDto) => {
  try {
    const u = normalizarUsuario(await obtenerUsuarioPorId(usuarioBase.id));
    const nombreSeparado = separarNombreCompleto(u.nombreCompleto);
    editandoId.value = usuarioBase.id;
    const rolId = u.rolId || rolIdDesdeTexto(u.rol) || rolIdDesdeTexto(usuarioBase.rol);
    form.value = {
      nombre: nombreSeparado.nombre,
      apellido: nombreSeparado.apellido,
      email: u.email,
      usuarioLogin: u.usuarioLogin,
      clave: "",
      rolId,
      telefono: "",
      debeCambiarClave: false,
      activo: u.activo
    };
    openFormModal.value = true;
  } catch (err: any) {
    notification.show(err.response?.data?.error || err.response?.data?.Error || "No se pudo cargar el usuario", "error");
  }
};

const cerrarFormModal = () => (openFormModal.value = false);

const guardarUsuario = async () => {
  if (!form.value.nombre.trim() || !form.value.apellido.trim()) return notification.show("Nombre y apellido son obligatorios", "error");
  if (!form.value.usuarioLogin.trim()) return notification.show("El usuario es obligatorio", "error");
  if (!emailValido(form.value.email)) return notification.show("El email no tiene un formato valido", "error");
  if (!editandoId.value && !form.value.clave.trim()) return notification.show("La clave es obligatoria", "error");
  if (form.value.clave.trim() && !claveSegura(form.value.clave)) return notification.show("La clave debe tener minimo 6 caracteres", "error");
  if (form.value.rolId <= 0) return notification.show("Selecciona un rol", "error");

  const dto = {
    nombre: form.value.nombre.trim(),
    apellido: form.value.apellido.trim(),
    email: form.value.email.trim(),
    usuarioLogin: form.value.usuarioLogin.trim(),
    rolId: form.value.rolId,
    telefono: form.value.telefono.trim() || null,
    debeCambiarClave: form.value.debeCambiarClave,
    activo: form.value.activo
  };

  try {
    if (editandoId.value) {
      await actualizarUsuario(editandoId.value, {
        ...dto,
        ...(form.value.clave.trim() ? { clave: form.value.clave.trim() } : {})
      });
      notification.show("Usuario actualizado correctamente", "success");
    } else {
      await crearUsuario({
        ...dto,
        clave: form.value.clave.trim()
      });
      notification.show("Usuario creado correctamente", "success");
    }
    openFormModal.value = false;
    await cargarUsuarios();
  } catch (err: any) {
    notification.show(extraerMensajeError(err, "No se pudo guardar el usuario"), "error");
  }
};

const activar = async (id: number) => {
  try {
    await activarUsuario(id);
    notification.show("Usuario activado correctamente", "success");
    await cargarUsuarios();
  } catch (err: any) {
    notification.show(extraerMensajeError(err, "No se pudo activar el usuario"), "error");
  }
};

const desactivar = async (id: number) => {
  try {
    await desactivarUsuario(id);
    notification.show("Usuario desactivado correctamente", "success");
    await cargarUsuarios();
  } catch (err: any) {
    notification.show(extraerMensajeError(err, "No se pudo desactivar el usuario"), "error");
  }
};

const abrirCambiarClave = (id: number) => {
  usuarioClaveId.value = id;
  claveForm.value = { claveActual: "", nuevaClave: "" };
  openClaveModal.value = true;
};

const guardarCambioClave = async () => {
  if (!usuarioClaveId.value) return;
  if (!claveForm.value.claveActual.trim()) return notification.show("La clave actual es obligatoria", "error");
  if (!claveForm.value.nuevaClave.trim()) return notification.show("La nueva clave es obligatoria", "error");
  if (!claveSegura(claveForm.value.nuevaClave)) return notification.show("La clave debe tener minimo 6 caracteres", "error");

  try {
    await cambiarClaveUsuario({
      usuarioId: usuarioClaveId.value,
      claveActual: claveForm.value.claveActual,
      nuevaClave: claveForm.value.nuevaClave
    });
    openClaveModal.value = false;
    notification.show("Clave actualizada correctamente", "success");
  } catch (err: any) {
    notification.show(extraerMensajeError(err, "No se pudo cambiar la clave"), "error");
  }
};

const probarLogin = async () => {
  try {
    const usuario = normalizarUsuario(await loginUsuario({
      usuario: loginForm.value.usuario,
      clave: loginForm.value.clave
    }));
    localStorage.setItem("mock_auth", "1");
    localStorage.setItem("mock_user", JSON.stringify({ usuario: usuario.rol, nombre: usuario.nombreCompleto, id: usuario.id }));
    loginForm.value = { usuario: "", clave: "" };
    openLoginModal.value = false;
    notification.show(`Login correcto: ${usuario.nombreCompleto}`, "success");
    await cargarUsuarios();
  } catch (err: any) {
    const message = err.response?.data || err.response?.data?.error || err.response?.data?.Error || "Usuario o contraseña incorrectos";
    notification.show(typeof message === "string" ? message : "Usuario o contraseña incorrectos", "error");
  }
};

watch([search, incluirInactivos], async () => {
  page.value = 1;
});

watch(incluirInactivos, async () => {
  await cargarUsuarios();
});

onMounted(async () => {
  await cargarUsuarios();
});
</script>
