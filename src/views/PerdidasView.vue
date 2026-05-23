<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Perdidas</h1>

    <div class="flex justify-end mb-4">
      <button
        @click="abrirCrear"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        + Nueva perdida
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
      <input
        v-model="search"
        placeholder="Buscar por motivo..."
        class="border px-3 py-2 rounded md:col-span-2"
      />

      <input
        v-model="desde"
        type="date"
        @blur="buscarPerdidasSiCambio"
        class="border px-3 py-2 rounded"
      />

      <input
        v-model="hasta"
        type="date"
        @blur="buscarPerdidasSiCambio"
        class="border px-3 py-2 rounded"
      />

      <select v-model.number="filtroEstado" class="border px-3 py-2 rounded">
        <option :value="0">Todos los estados</option>
        <option :value="EstadoPerdida.Pendiente">Pendiente</option>
        <option :value="EstadoPerdida.Confirmada">Confirmada</option>
        <option :value="EstadoPerdida.Anulada">Anulada</option>
      </select>
    </div>

    <div class="overflow-x-auto min-h-[320px]">
      <table class="w-full bg-white rounded shadow">
        <thead>
          <tr class="text-left border-b">
            <th class="p-2">Fecha</th>
            <th class="p-2">Motivo</th>
            <th class="p-2">Observacion</th>
            <th class="p-2">Estado</th>
            <th class="p-2">Productos</th>
            <th class="p-2 text-right">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="p in perdidasPaginadas"
            :key="p.id"
            class="border-b hover:bg-gray-50"
          >
            <td class="p-2">{{ formatearFecha(p.fecha) }}</td>
            <td class="p-2">{{ p.motivo }}</td>
            <td class="p-2">{{ p.observacion || "-" }}</td>
            <td class="p-2">
              <span :class="colorEstado(p.idEstado)">
                {{ nombreEstado(p.idEstado) }}
              </span>
            </td>
            <td class="p-2">
              <div class="flex items-center gap-2">
                <span>{{ cantidadProductosPerdida(p) }}</span>

                <div
                  v-if="detalleProductosPerdida(p).length"
                  class="group relative inline-flex"
                >
                  <button
                    type="button"
                    class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-amber-300 bg-amber-100 text-[11px] font-bold text-amber-700 shadow-sm transition-colors hover:border-amber-400 hover:bg-amber-200 hover:text-amber-800"
                    aria-label="Ver productos de la perdida"
                  >
                    i
                  </button>

                  <div class="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-72 -translate-x-1/2 group-hover:block">
                    <div class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-lg">
                      <p class="mb-2 font-semibold text-slate-600">Productos cargados</p>
                      <ul class="max-h-44 space-y-1 overflow-y-auto pr-1">
                        <li
                          v-for="detalle in detalleProductosPerdida(p)"
                          :key="`${p.id}-${detalle.idProducto}-${detalle.cantidad}`"
                          class="flex items-start justify-between gap-3"
                        >
                          <span class="text-slate-700">{{ nombreProducto(detalle.idProducto) }}</span>
                          <span class="whitespace-nowrap text-slate-500">({{ detalle.cantidad }})</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </td>
            <td class="p-2 text-right">
              <button
                @click="abrirEdicion(p)"
                class="text-blue-500 mr-2 cursor-pointer inline-flex items-center justify-center rounded-full p-1.5 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                title="Editar perdida"
                aria-label="Editar perdida"
              >
                ✏️
              </button>
              <button
                v-if="esAdmin && p.idEstado === EstadoPerdida.Pendiente"
                @click="autorizar(p.id)"
                class="text-green-600 mr-2 cursor-pointer inline-flex items-center justify-center rounded-full p-1.5 hover:bg-green-50 hover:text-green-700 transition-colors"
                title="Aprobar perdida"
                aria-label="Aprobar perdida"
              >
                ✔️
              </button>
              <button
                v-if="esAdmin && p.idEstado === EstadoPerdida.Pendiente"
                @click="rechazar(p.id)"
                class="text-red-600 cursor-pointer inline-flex items-center justify-center rounded-full p-1.5 hover:bg-red-50 hover:text-red-700 transition-colors"
                title="Rechazar perdida"
                aria-label="Rechazar perdida"
              >
                ❌
              </button>
            </td>
          </tr>

          <tr v-if="!loading && perdidasFiltradas.length === 0">
            <td colspan="6" class="text-center py-4 text-gray-400">
              No hay perdidas
            </td>
          </tr>

          <tr v-if="loading && !perdidas.length">
            <td colspan="6" class="text-center py-4 text-gray-400">
              Cargando perdidas...
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex justify-center items-center gap-2 mt-4">
      <button
        @click="page--"
        :disabled="page === 1"
        class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        ←
      </button>

      <span class="text-sm">
        Pagina {{ page }} de {{ totalPaginas }}
      </span>

      <button
        @click="page++"
        :disabled="page === totalPaginas"
        class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        →
      </button>
    </div>

    <div
      v-if="openModal"
      @click.self="cerrarModal"
      class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6">
        <h2 class="text-lg font-bold mb-4">
          {{ modoEdicion ? "Editar perdida" : "Nueva perdida" }}
        </h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Motivo *</label>
            <input
              v-model="motivo"
              class="w-full border px-3 py-2 rounded"
            />
            <p v-if="errores.motivo" class="text-xs text-red-500 mt-1">
              {{ errores.motivo }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Observacion</label>
            <textarea
              v-model="observacion"
              rows="3"
              class="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="block text-sm font-medium">Productos *</label>
              <button
                @click="agregarDetalle"
                :disabled="!puedeEditarDetalles"
                class="bg-green-500 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
              >
                + Agregar
              </button>
            </div>

            <div
              v-for="(d, index) in detalles"
              :key="`${d.id}-${index}`"
              class="grid grid-cols-12 gap-2 mb-2"
            >
              <select
                v-model.number="d.idProducto"
                :disabled="!puedeEditarDetalles"
                class="col-span-7 border px-2 py-2 rounded"
              >
                <option :value="0">-- Seleccione un producto --</option>
                <option
                  v-for="p in productos"
                  :key="p.id"
                  :value="p.id"
                >
                  {{ p.nombre }}
                </option>
              </select>

              <input
                v-model.number="d.cantidad"
                type="number"
                min="1"
                step="1"
                :disabled="!puedeEditarDetalles"
                class="col-span-4 border px-2 py-2 rounded"
              />

              <button
                @click="eliminarDetalle(index)"
                :disabled="!puedeEditarDetalles"
                class="col-span-1 text-red-500 disabled:opacity-50 cursor-pointer"
                title="Quitar producto"
              >
                ✖
              </button>

              <div class="col-span-12 text-xs text-gray-500">
                Stock actual:
                {{ stockProducto(d.idProducto) }}
              </div>
            </div>

            <p v-if="errores.detalles" class="text-xs text-red-500 mt-1">
              {{ errores.detalles }}
            </p>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-5">
          <button
            @click="cerrarModal"
            class="px-4 py-2 rounded bg-gray-200"
          >
            Cancelar
          </button>

          <button
            @click="guardar"
            :disabled="guardando"
            class="px-4 py-2 rounded bg-blue-500 text-white disabled:opacity-60"
          >
            {{ guardando ? "Guardando..." : modoEdicion ? "Actualizar" : "Guardar" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useNotificationStore } from "@/stores/notificaciones";
import { useProductosStore } from "@/modules/productos/store";
import {
  actualizarDetallePerdida,
  actualizarPerdida,
  agregarDetallePerdida,
  aprobarPerdida,
  crearPerdida,
  eliminarDetallePerdida,
  obtenerPerdidaPorId,
  obtenerPerdidasEntreFechas,
  rechazarPerdida
} from "@/modules/perdidas/services";
import { EstadoPerdida, type DetallePerdida, type Perdida } from "@/modules/perdidas/types";

const notification = useNotificationStore();
const productosStore = useProductosStore();

const notificationUser = (() => {
  try {
    const raw = localStorage.getItem("mock_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

const usuario = ref({
  id: Number(notificationUser?.id ?? 1),
  nombre: String(notificationUser?.nombre ?? "Administrador"),
  rol: String(notificationUser?.usuario ?? "admin").toLowerCase() === "admin" ? "admin" : "usuario"
});

const esAdmin = computed(() => usuario.value.rol === "admin");

const productos = computed(() => productosStore.productos.filter((p) => p.activo));
const perdidas = ref<Perdida[]>([]);
const search = ref("");
const filtroEstado = ref(0);
const loading = ref(false);
const guardando = ref(false);

const hoy = new Date();
const toInputDate = (fecha: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`;
};

const desde = ref(toInputDate(new Date(hoy.getFullYear(), hoy.getMonth(), 1)));
const hasta = ref(toInputDate(hoy));
const ultimoRangoBuscado = ref({
  desde: desde.value,
  hasta: hasta.value
});

const page = ref(1);
const pageSize = 7;

const openModal = ref(false);
const modoEdicion = ref(false);
const perdidaEditando = ref<number | null>(null);
const estadoPerdidaEditando = ref<number>(EstadoPerdida.Pendiente);

const motivo = ref("");
const observacion = ref("");

const detalles = ref<DetallePerdida[]>([]);
const detallesOriginales = ref<DetallePerdida[]>([]);

const errores = ref<Record<string, string>>({});

watch([search, filtroEstado], () => {
  page.value = 1;
});

const puedeEditarDetalles = computed(() => {
  if (!modoEdicion.value) return true;
  return estadoPerdidaEditando.value === EstadoPerdida.Pendiente;
});

const nombreEstado = (id: number) => {
  switch (id) {
    case EstadoPerdida.Pendiente:
      return "Pendiente";
    case EstadoPerdida.Confirmada:
      return "Confirmada";
    case EstadoPerdida.Anulada:
      return "Anulada";
    default:
      return "-";
  }
};

const colorEstado = (id: number) => {
  switch (id) {
    case EstadoPerdida.Pendiente:
      return "text-yellow-500";
    case EstadoPerdida.Confirmada:
      return "text-green-600";
    case EstadoPerdida.Anulada:
      return "text-red-500";
    default:
      return "";
  }
};

const nombreProducto = (idProducto: number) => {
  return productos.value.find((p) => p.id === idProducto)?.nombre ?? `Producto #${idProducto}`;
};

const formatearFecha = (valor: string) => {
  return new Date(valor).toLocaleString("es-AR");
};

const stockProducto = (idProducto: number) => {
  if (!idProducto) return "-";
  return productos.value.find((p) => p.id === idProducto)?.stockActual ?? "-";
};

const detalleProductosPerdida = (perdida: Perdida) => {
  return Array.isArray(perdida.detalles) ? perdida.detalles : [];
};

const cantidadProductosPerdida = (perdida: Perdida) => {
  return detalleProductosPerdida(perdida).length;
};

const perdidasFiltradas = computed(() => {
  const texto = search.value.trim().toLowerCase();
  return perdidas.value.filter((p) => {
    const coincideTexto =
      p.motivo.toLowerCase().includes(texto) ||
      (p.observacion || "").toLowerCase().includes(texto);
    const coincideEstado = filtroEstado.value === 0 ? true : p.idEstado === filtroEstado.value;
    return coincideTexto && coincideEstado;
  });
});

const totalPaginas = computed(() => {
  const total = Math.ceil(perdidasFiltradas.value.length / pageSize);
  return total || 1;
});

const perdidasPaginadas = computed(() => {
  const start = (page.value - 1) * pageSize;
  return perdidasFiltradas.value.slice(start, start + pageSize);
});

const resetForm = () => {
  motivo.value = "";
  observacion.value = "";
  detalles.value = [];
  detallesOriginales.value = [];
  estadoPerdidaEditando.value = EstadoPerdida.Pendiente;
  errores.value = {};
};

const validarFiltros = () => {
  if (!desde.value || !hasta.value) {
    notification.show("Las fechas desde y hasta son obligatorias", "error");
    return false;
  }
  if (new Date(`${desde.value}T00:00:00`) > new Date(`${hasta.value}T23:59:59`)) {
    notification.show("La fecha desde no puede ser mayor a hasta", "error");
    return false;
  }
  return true;
};

const buscarPerdidas = async () => {
  if (!validarFiltros()) return;
  loading.value = true;
  try {
    const desdeApi = `${desde.value}T00:00:00`;
    const hastaApi = `${hasta.value}T23:59:59`;
    const perdidasBase = await obtenerPerdidasEntreFechas(desdeApi, hastaApi);
    perdidas.value = await Promise.all(
      perdidasBase.map(async (perdida) => {
        if (Array.isArray(perdida.detalles) && perdida.detalles.length) {
          return perdida;
        }

        try {
          const perdidaCompleta = await obtenerPerdidaPorId(perdida.id);
          return {
            ...perdida,
            detalles: Array.isArray(perdidaCompleta.detalles) ? perdidaCompleta.detalles : []
          };
        } catch {
          return {
            ...perdida,
            detalles: Array.isArray(perdida.detalles) ? perdida.detalles : []
          };
        }
      })
    );
    ultimoRangoBuscado.value = {
      desde: desde.value,
      hasta: hasta.value
    };
    page.value = 1;
  } catch (err: any) {
    const message = err.response?.data?.error || err.response?.data?.Error || "No se pudieron cargar las perdidas";
    notification.show(message, "error");
  } finally {
    loading.value = false;
  }
};

const buscarPerdidasSiCambio = async () => {
  if (
    desde.value === ultimoRangoBuscado.value.desde &&
    hasta.value === ultimoRangoBuscado.value.hasta
  ) {
    return;
  }

  await buscarPerdidas();
};

const abrirCrear = () => {
  modoEdicion.value = false;
  perdidaEditando.value = null;
  resetForm();
  agregarDetalle();
  openModal.value = true;
};

const abrirEdicion = async (perdida: Perdida) => {
  modoEdicion.value = true;
  perdidaEditando.value = perdida.id;
  errores.value = {};

  try {
    const perdidaCompleta = await obtenerPerdidaPorId(perdida.id);
    motivo.value = perdidaCompleta.motivo;
    observacion.value = perdidaCompleta.observacion || "";
    estadoPerdidaEditando.value = perdidaCompleta.idEstado;
    detalles.value = (perdidaCompleta.detalles || []).map((d) => ({ ...d }));
    detallesOriginales.value = (perdidaCompleta.detalles || []).map((d) => ({ ...d }));
    openModal.value = true;
  } catch (err: any) {
    const message = err.response?.data?.error || err.response?.data?.Error || "No se pudo cargar la perdida";
    notification.show(message, "error");
  }
};

const autorizar = async (id: number) => {
  try {
    const resp = await aprobarPerdida(id);
    notification.show(resp?.mensaje || "Perdida aprobada correctamente", "success");
    await buscarPerdidas();
  } catch (err: any) {
    const message = err.response?.data?.error || err.response?.data?.Error || "No se pudo aprobar la perdida";
    notification.show(message, "error");
  }
};

const rechazar = async (id: number) => {
  try {
    const resp = await rechazarPerdida(id);
    notification.show(resp?.mensaje || "Perdida rechazada correctamente", "success");
    await buscarPerdidas();
  } catch (err: any) {
    const message = err.response?.data?.error || err.response?.data?.Error || "No se pudo rechazar la perdida";
    notification.show(message, "error");
  }
};

const cerrarModal = () => {
  openModal.value = false;
};

const agregarDetalle = () => {
  detalles.value.push({
    id: 0,
    idPerdida: perdidaEditando.value ?? 0,
    idProducto: 0,
    cantidad: 1
  });
};

const eliminarDetalle = (index: number) => {
  detalles.value.splice(index, 1);
};

const validar = () => {
  errores.value = {};

  if (!motivo.value.trim()) {
    errores.value.motivo = "El motivo es obligatorio.";
  }

  if (!detalles.value.length) {
    errores.value.detalles = "Debe agregar productos.";
  }

  const productoIds = new Set<number>();
  const detalleInvalido = detalles.value.some((d) => {
    if (!d.idProducto || d.cantidad <= 0 || !Number.isInteger(d.cantidad)) return true;
    if (productoIds.has(d.idProducto)) return true;
    productoIds.add(d.idProducto);
    return false;
  });

  if (detalleInvalido) {
    errores.value.detalles = "Complete correctamente los productos. No repita productos y use cantidades enteras mayores a 0.";
  }

  const detalleSuperaStock = detalles.value.find((d) => {
    const stockActual = productos.value.find((p) => p.id === d.idProducto)?.stockActual ?? 0;
    return d.idProducto > 0 && d.cantidad > stockActual;
  });

  if (detalleSuperaStock) {
    const stockActual = productos.value.find((p) => p.id === detalleSuperaStock.idProducto)?.stockActual ?? 0;
    errores.value.detalles = `La cantidad de ${nombreProducto(detalleSuperaStock.idProducto)} no puede superar el stock actual (${stockActual}).`;
  }

  return Object.keys(errores.value).length === 0;
};

const sincronizarDetalles = async (idPerdida: number) => {
  const originales = new Map(detallesOriginales.value.map((d) => [d.id, d]));
  const actualesConId = detalles.value.filter((d) => d.id > 0);
  const actualesSinId = detalles.value.filter((d) => d.id <= 0);

  const idsActuales = new Set(actualesConId.map((d) => d.id));
  const eliminados = detallesOriginales.value.filter((d) => d.id > 0 && !idsActuales.has(d.id));

  for (const detalle of eliminados) {
    await eliminarDetallePerdida(detalle.id);
  }

  for (const detalle of actualesConId) {
    const original = originales.get(detalle.id);
    if (!original) continue;
    if (original.idProducto !== detalle.idProducto || original.cantidad !== detalle.cantidad) {
      await actualizarDetallePerdida({
        id: detalle.id,
        idPerdida,
        idProducto: detalle.idProducto,
        cantidad: detalle.cantidad
      });
    }
  }

  for (const detalle of actualesSinId) {
    await agregarDetallePerdida({
      idPerdida,
      idProducto: detalle.idProducto,
      cantidad: detalle.cantidad
    });
  }
};

const guardar = async () => {
  if (!validar()) return;

  guardando.value = true;
  try {
    if (modoEdicion.value && perdidaEditando.value) {
      const resp = await actualizarPerdida(perdidaEditando.value, {
        motivo: motivo.value.trim(),
        observacion: observacion.value.trim()
      });

      if (estadoPerdidaEditando.value === EstadoPerdida.Pendiente) {
        await sincronizarDetalles(perdidaEditando.value);
      }

      notification.show(resp?.mensaje || "Perdida actualizada correctamente", "success");
    } else {
      const ahora = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const fechaLocal = `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}T${pad(ahora.getHours())}:${pad(ahora.getMinutes())}:${pad(ahora.getSeconds())}`;

      const resp = await crearPerdida({
        fecha: fechaLocal,
        motivo: motivo.value.trim(),
        observacion: observacion.value.trim(),
        idUsuario: 2,
        idEstado: EstadoPerdida.Pendiente,
        detalles: detalles.value.map((d) => ({
          idProducto: d.idProducto,
          cantidad: d.cantidad
        }))
      });

      notification.show(resp?.mensaje || "Perdida creada correctamente", "success");
    }

    await buscarPerdidas();
    cerrarModal();
  } catch (err: any) {
    const message = err.response?.data?.error || err.response?.data?.Error || "No se pudo guardar la perdida";
    notification.show(message, "error");
  } finally {
    guardando.value = false;
  }
};

onMounted(async () => {
  await productosStore.fetchProductos(false);
  await buscarPerdidas();
});
</script>
