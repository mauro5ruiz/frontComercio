<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Proveedores</h1>

    <div class="flex justify-end mb-4">
      <button
        @click="abrirCrear"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        + Nuevo proveedor
      </button>
    </div>

    <div class="flex items-center gap-2 mb-4">
      <input id="chkEliminados" v-model="incluirEliminados" type="checkbox" />
      <label for="chkEliminados" class="cursor-pointer">Incluir inactivos</label>
    </div>

    <input
      v-model="search"
      placeholder="Buscar proveedor..."
      class="w-full border px-3 py-2 rounded mb-4"
    />

    <table class="w-full bg-white rounded shadow">
      <thead>
        <tr class="text-left border-b">
          <th class="p-2">Logo</th>
          <th class="p-2">Razon social</th>
          <th class="p-2">CUIT</th>
          <th class="p-2">Telefono</th>
          <th class="p-2">Activo</th>
          <th class="p-2 text-right">Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="proveedor in proveedoresPaginados"
          :key="proveedor.id"
          class="border-b hover:bg-gray-50"
        >
          <td class="p-2 w-20 h-16">
            <div class="w-full h-full flex items-center justify-center">
              <img
                v-if="proveedor.urlImagen"
                :src="baseURL + proveedor.urlImagen"
                class="max-w-full max-h-full object-contain"
              />
              <span v-else class="text-gray-400 text-xs">Sin imagen</span>
            </div>
          </td>

          <td class="p-2">{{ proveedor.razonSocial }}</td>
          <td class="p-2">{{ proveedor.cuit }}</td>
          <td class="p-2">{{ proveedor.telefono || "-" }}</td>
          <td class="p-2">
            <span :class="proveedor.activo ? 'text-green-600' : 'text-red-500'">
              {{ proveedor.activo ? "Si" : "No" }}
            </span>
          </td>
          <td class="p-2 text-right">
            <button @click="abrirCuentaCorriente(proveedor)" class="text-emerald-600 mr-2">
              Cuenta corriente
            </button>
            <button @click="abrirEdicion(proveedor)" class="text-blue-500 mr-2">Editar</button>
            <button
              v-if="proveedor.activo"
              @click="desactivar(proveedor.id)"
              class="text-yellow-500 mr-2"
              title="Desactivar"
            >
              Desactivar
            </button>
            <button
              v-else
              @click="activar(proveedor.id)"
              class="text-green-500 mr-2"
              title="Activar"
            >
              Activar
            </button>
            <button @click="abrirConfirmacion(proveedor.id)" class="text-red-500">Eliminar</button>
          </td>
        </tr>

        <tr v-if="proveedoresFiltrados.length === 0">
          <td colspan="6" class="text-center py-4 text-gray-400">No hay proveedores</td>
        </tr>
      </tbody>
    </table>

    <div class="flex justify-center items-center gap-2 mt-4">
      <button
        @click="page--"
        :disabled="page === 1"
        class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        &larr;
      </button>

      <span class="text-sm">Pagina {{ page }} de {{ totalPaginas }}</span>

      <button
        @click="page++"
        :disabled="page === totalPaginas"
        class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        &rarr;
      </button>
    </div>

    <div
      v-if="openModal"
      @click.self="cerrarModal"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
        <div class="px-6 py-4 border-b bg-gray-50 rounded-t-xl">
          <h2 class="text-lg font-bold text-gray-800">
            {{ modoEdicion ? "Editar proveedor" : "Nuevo proveedor" }}
          </h2>
        </div>

        <div class="p-6 overflow-y-auto space-y-5">
          <div>
            <h3 class="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              Datos principales
            </h3>

            <div class="space-y-3">
              <div>
                <div class="flex items-center gap-3">
                  <label class="w-40 text-sm font-medium text-gray-700">Razon social *</label>
                  <input
                    v-model="razonSocial"
                    class="flex-1 border bg-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    :class="errores.razonSocial ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'"
                  />
                </div>
                <p v-if="errores.razonSocial" class="text-xs text-red-500 mt-1 ml-[172px]">{{ errores.razonSocial }}</p>
              </div>

              <div>
                <div class="flex items-center gap-3">
                  <label class="w-40 text-sm font-medium text-gray-700">CUIT *</label>
                  <input
                    v-model="cuit"
                    placeholder="Ej: 20345678901"
                    class="flex-1 border bg-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    :class="errores.cuit ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'"
                  />
                </div>
                <p v-if="errores.cuit" class="text-xs text-red-500 mt-1 ml-[172px]">{{ errores.cuit }}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Contacto</h3>

            <div class="space-y-3">
              <div>
                <div class="flex items-center gap-3">
                  <label class="w-40 text-sm font-medium text-gray-700">Telefono</label>
                  <input v-model="telefono" class="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
                </div>
              </div>

              <div>
                <div class="flex items-center gap-3">
                  <label class="w-40 text-sm font-medium text-gray-700">Email</label>
                  <input
                    v-model="email"
                    type="email"
                    class="flex-1 border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    :class="errores.email ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'"
                  />
                </div>
                <p v-if="errores.email" class="text-xs text-red-500 mt-1 ml-[172px]">{{ errores.email }}</p>
              </div>

              <div class="flex items-center gap-3">
                <label class="w-40 text-sm font-medium text-gray-700">Persona contacto</label>
                <input v-model="personaContacto" class="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
              </div>

              <div class="flex items-center gap-3">
                <label class="w-40 text-sm font-medium text-gray-700">Cond. IVA</label>
                <input v-model="condicionIva" class="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Direccion</h3>

            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <label class="w-40 text-sm font-medium text-gray-700">Direccion</label>
                <input v-model="direccion" class="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="flex items-center gap-3">
                  <label class="w-20 text-sm font-medium text-gray-700">Localidad</label>
                  <input v-model="localidad" class="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
                </div>

                <div class="flex items-center gap-3">
                  <label class="w-20 text-sm font-medium text-gray-700">Provincia</label>
                  <input v-model="provincia" class="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
                </div>
              </div>

              <div class="flex items-center gap-3">
                <label class="w-40 text-sm font-medium text-gray-700">Codigo postal</label>
                <input v-model="codigoPostal" class="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              Informacion adicional
            </h3>

            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-1">Observaciones</label>
              <textarea
                v-model="observaciones"
                rows="3"
                class="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
              ></textarea>
            </div>
          </div>

          <div class="flex items-center justify-between border-t pt-4">
            <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input v-model="activo" type="checkbox" class="rounded" />
              Activo
            </label>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-700 mb-1 block">Imagen</label>

            <input
              type="file"
              accept="image/*"
              @change="onFileChange"
              class="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition"
            />

            <button
              v-if="preview"
              @click="quitarImagen"
              class="text-red-500 text-sm mt-2 hover:underline"
            >
              Quitar imagen
            </button>

            <div v-if="preview" class="mt-3">
              <img :src="preview" class="w-24 h-24 object-contain border rounded-md" />
            </div>
          </div>
        </div>

        <div class="px-6 py-4 border-t bg-gray-50 rounded-b-xl flex justify-end gap-2">
          <button @click="cerrarModal" class="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition">
            Cancelar
          </button>

          <button @click="guardar" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
            {{ modoEdicion ? "Actualizar" : "Guardar" }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="openDeleteModal"
      @click.self="cerrarConfirmacion"
      class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
        <h2 class="text-lg font-bold mb-3 text-gray-800">Confirmar eliminacion</h2>

        <p class="text-sm text-gray-600 mb-4">
          Estas seguro que queres eliminar permanentemente este proveedor?
        </p>

        <div class="flex justify-end gap-2">
          <button @click="cerrarConfirmacion" class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
            Cancelar
          </button>
          <button @click="confirmarEliminacion" class="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600">
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="openCuentaCorrienteModal && proveedorCuentaCorriente"
      @click.self="cerrarCuentaCorriente"
      class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 class="text-lg font-bold text-gray-800">Cuenta corriente del proveedor</h2>
            <p class="text-sm text-gray-500">
              {{ proveedorCuentaCorriente.razonSocial }} - {{ proveedorCuentaCorriente.cuit }}
            </p>
          </div>
          <button @click="cerrarCuentaCorriente" class="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300">Cerrar</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div>
            <label class="text-sm text-gray-600">Desde</label>
            <input
              v-model="cuentaCorrienteDesde"
              type="date"
              :max="cuentaCorrienteHasta || undefined"
              class="w-full border px-3 py-2 rounded-md"
              @blur="buscarCuentaCorriente"
            />
          </div>
          <div>
            <label class="text-sm text-gray-600">Hasta</label>
            <input
              v-model="cuentaCorrienteHasta"
              type="date"
              :min="cuentaCorrienteDesde || undefined"
              class="w-full border px-3 py-2 rounded-md"
              @blur="buscarCuentaCorriente"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div class="rounded-lg border bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-wide text-slate-500">Saldo pendiente</div>
            <div class="mt-1 text-2xl font-semibold text-slate-900">{{ money(saldoProveedorSeleccionado) }}</div>
          </div>
          <div class="rounded-lg border bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-wide text-slate-500">Compras pendientes</div>
            <div class="mt-1 text-2xl font-semibold text-slate-900">{{ comprasPendientesProveedor.length }}</div>
          </div>
          <div class="rounded-lg border bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-wide text-slate-500">Movimientos detectados</div>
            <div class="mt-1 text-2xl font-semibold text-slate-900">{{ movimientosProveedor.length }}</div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div class="rounded-lg border">
            <div class="border-b bg-gray-50 px-4 py-3">
              <h3 class="font-semibold text-gray-800">Compras con saldo</h3>
              <p class="text-xs text-gray-500">Comprobantes pendientes dentro del rango filtrado.</p>
            </div>
            <div v-if="comprasPendientesProveedor.length" class="divide-y">
              <div v-for="compra in comprasPendientesProveedor" :key="compra.id" class="px-4 py-3">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="font-medium text-gray-800">{{ compra.numeroComprobante }}</div>
                    <div class="text-sm text-gray-500">{{ formatDate(compra.fecha) }}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm text-gray-500">Saldo</div>
                    <div class="font-semibold text-amber-700">{{ money(compra.saldoPendiente) }}</div>
                  </div>
                </div>
                <div class="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-500">
                  <div>Total: {{ money(compra.total) }}</div>
                  <div>Pagado: {{ money(compra.totalPagado) }}</div>
                  <div>Estado: {{ compra.estado === 2 ? "Anulada" : "Activa" }}</div>
                </div>
              </div>
            </div>
            <div v-else class="px-4 py-6 text-sm text-gray-400">
              No hay compras pendientes para este proveedor en el rango seleccionado.
            </div>
          </div>

          <div class="rounded-lg border">
            <div class="border-b bg-gray-50 px-4 py-3">
              <h3 class="font-semibold text-gray-800">Movimientos</h3>
              <p class="text-xs text-gray-500">Historial de compras y pagos registrados.</p>
            </div>
            <div v-if="movimientosProveedor.length" class="divide-y">
              <div v-for="mov in movimientosProveedor" :key="mov.key" class="px-4 py-3">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="font-medium text-gray-800">{{ mov.titulo }}</div>
                    <div class="text-sm text-gray-500">{{ mov.fecha }}</div>
                  </div>
                  <div class="text-right font-semibold" :class="mov.tipo === 'pago' ? 'text-emerald-700' : 'text-slate-700'">
                    {{ mov.tipo === "pago" ? "-" : "" }}{{ money(mov.importe) }}
                  </div>
                </div>
                <div class="mt-1 text-xs text-gray-500">{{ mov.descripcion }}</div>
              </div>
            </div>
            <div v-else class="px-4 py-6 text-sm text-gray-400">
              No hay movimientos para este proveedor en el rango seleccionado.
            </div>
          </div>
        </div>

        <div class="rounded-lg border p-4">
          <h3 class="font-semibold text-gray-800 mb-3">Registrar pago</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="text-sm text-gray-700">Forma de pago *</label>
              <select v-model.number="pagoCuentaCorriente.idFormaPago" class="w-full border px-3 py-2 rounded-md">
                <option :value="0">Seleccionar</option>
                <option v-for="forma in formasDePago" :key="forma.id" :value="forma.id">{{ forma.nombre }}</option>
              </select>
            </div>
            <div>
              <div class="flex items-center justify-between gap-3">
                <label class="text-sm text-gray-700">Importe *</label>
                <button
                  v-if="saldoProveedorSeleccionado > 0"
                  type="button"
                  class="text-sm text-emerald-700 hover:text-emerald-800"
                  @click="usarSaldoPendienteProveedor"
                >
                  Usar saldo
                </button>
              </div>
              <input v-model.number="pagoCuentaCorriente.importe" type="number" min="0.01" step="0.01" class="w-full border px-3 py-2 rounded-md" />
            </div>
            <div class="flex items-end">
              <button @click="guardarPagoCuentaCorriente" class="w-full bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">
                Registrar pago
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useComprasStore } from "@/modules/compras/store";
import type { Compra } from "@/modules/compras/types";
import { useFormasDePagoStore } from "@/modules/formasDePagos/store";
import { proveedorSchema } from "@/modules/proveedores/schema";
import { useProveedoresStore } from "@/modules/proveedores/store";
import type { Proveedor } from "@/modules/proveedores/types";
import { useNotificationStore } from "@/stores/notificaciones";

const baseURL = import.meta.env.VITE_FILES_URL;
const store = useProveedoresStore();
const comprasStore = useComprasStore();
const formasDePagoStore = useFormasDePagoStore();
const notification = useNotificationStore();

const search = ref("");
const openModal = ref(false);
const openDeleteModal = ref(false);
const openCuentaCorrienteModal = ref(false);
const incluirEliminados = ref(false);
const proveedorCuentaCorriente = ref<Proveedor | null>(null);

const razonSocial = ref("");
const cuit = ref("");
const telefono = ref("");
const email = ref("");
const personaContacto = ref("");
const condicionIva = ref("");
const direccion = ref("");
const localidad = ref("");
const provincia = ref("");
const codigoPostal = ref("");
const observaciones = ref("");
const activo = ref(true);

const imagen = ref<File | null>(null);
const preview = ref<string | null>(null);
const eliminarImagen = ref(false);

const modoEdicion = ref(false);
const proveedorEditando = ref<number | null>(null);
const proveedorAEliminar = ref<number | null>(null);
const errores = ref<Record<string, string | undefined>>({});

const page = ref(1);
const pageSize = 7;
const hoy = new Date();
const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
const cuentaCorrienteDesde = ref(toLocalInputDate(primerDiaMes));
const cuentaCorrienteHasta = ref(toLocalInputDate(hoy));
const pagoCuentaCorriente = ref({
  idFormaPago: 0,
  importe: 0
});

onMounted(() => {
  store.fetchProveedores(incluirEliminados.value);
  formasDePagoStore.fetchFormasDePago();
});

watch(incluirEliminados, (nuevoValor) => {
  page.value = 1;
  store.fetchProveedores(nuevoValor);
});

const proveedoresFiltrados = computed(() =>
  store.proveedores.filter((proveedor) => {
    const coincideBusqueda = proveedor.razonSocial.toLowerCase().includes(search.value.toLowerCase());
    const incluir = incluirEliminados.value ? true : proveedor.activo;
    return coincideBusqueda && incluir;
  }),
);

const totalPaginas = computed(() => Math.max(1, Math.ceil(proveedoresFiltrados.value.length / pageSize)));

const proveedoresPaginados = computed(() => {
  const start = (page.value - 1) * pageSize;
  return proveedoresFiltrados.value.slice(start, start + pageSize);
});

const formasDePago = computed(() => formasDePagoStore.formasDePago);

const comprasProveedorSeleccionado = computed<Compra[]>(() =>
  proveedorCuentaCorriente.value
    ? comprasStore.compras.filter((compra) => compra.idProveedor === proveedorCuentaCorriente.value?.id)
    : [],
);

const comprasPendientesProveedor = computed(() =>
  comprasProveedorSeleccionado.value
    .filter((compra) => compra.estado !== 2 && compra.saldoPendiente > 0)
    .sort((a, b) => +parseApiDate(a.fecha) - +parseApiDate(b.fecha)),
);

const saldoProveedorSeleccionado = computed(() =>
  comprasPendientesProveedor.value.reduce((acc, compra) => acc + (compra.saldoPendiente || 0), 0),
);

const movimientosProveedor = computed(() =>
  comprasProveedorSeleccionado.value
    .flatMap((compra) => {
      const movimientosCompra = [
        {
          key: `compra-${compra.id}`,
          fechaOrden: parseApiDate(compra.fecha).getTime(),
          fecha: formatDate(compra.fecha),
          tipo: "compra" as const,
          titulo: `Compra ${compra.numeroComprobante}`,
          descripcion: `Alta de compra por ${money(compra.total)}. Saldo actual ${money(compra.saldoPendiente)}.`,
          importe: compra.total
        }
      ];

      const pagos = (compra.pagos || []).map((pago, index) => ({
        key: `pago-${compra.id}-${pago.id ?? index}`,
        fechaOrden: parseApiDate(pago.fechaPago || compra.fecha).getTime(),
        fecha: formatDate(pago.fechaPago || compra.fecha),
        tipo: "pago" as const,
        titulo: `Pago aplicado a ${compra.numeroComprobante}`,
        descripcion: `${nombreFormaPago(pago.idFormaPago ?? 0)}${pago.referencia ? ` - ${pago.referencia}` : ""}`,
        importe: pago.importe
      }));

      return [...movimientosCompra, ...pagos];
    })
    .sort((a, b) => b.fechaOrden - a.fechaOrden),
);

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

function toLocalInputDate(date: Date) {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
}

function parseApiDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, (month || 1) - 1, day || 1);
  }
  return new Date(value);
}

function formatDate(value: string) {
  if (!value) return "-";
  return parseApiDate(value).toLocaleDateString("es-AR");
}

function money(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2
  }).format(value || 0);
}

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0] ?? null;
  imagen.value = file;
  eliminarImagen.value = false;

  if (file) {
    preview.value = URL.createObjectURL(file);
  }
};

const resetForm = () => {
  razonSocial.value = "";
  cuit.value = "";
  telefono.value = "";
  email.value = "";
  personaContacto.value = "";
  condicionIva.value = "";
  direccion.value = "";
  localidad.value = "";
  provincia.value = "";
  codigoPostal.value = "";
  observaciones.value = "";
  activo.value = true;
  imagen.value = null;
  preview.value = null;
  eliminarImagen.value = false;
  errores.value = {};
};

const abrirCrear = () => {
  modoEdicion.value = false;
  proveedorEditando.value = null;
  resetForm();
  openModal.value = true;
};

const abrirEdicion = (proveedor: Proveedor) => {
  modoEdicion.value = true;
  proveedorEditando.value = proveedor.id;
  errores.value = {};

  razonSocial.value = proveedor.razonSocial ?? "";
  cuit.value = proveedor.cuit ?? "";
  telefono.value = proveedor.telefono ?? "";
  email.value = proveedor.email ?? "";
  personaContacto.value = proveedor.personaContacto ?? "";
  condicionIva.value = proveedor.condicionIva ?? "";
  direccion.value = proveedor.direccion ?? "";
  localidad.value = proveedor.localidad ?? "";
  provincia.value = proveedor.provincia ?? "";
  codigoPostal.value = proveedor.codigoPostal ?? "";
  observaciones.value = proveedor.observaciones ?? "";
  activo.value = proveedor.activo;

  imagen.value = null;
  preview.value = proveedor.urlImagen ? baseURL + proveedor.urlImagen : null;
  eliminarImagen.value = false;
  openModal.value = true;
};

const cerrarModal = () => {
  openModal.value = false;
  errores.value = {};
};

const guardar = async () => {
  errores.value = {};

  const formValues = {
    razonSocial: razonSocial.value,
    cuit: cuit.value,
    condicionIva: condicionIva.value || undefined,
    telefono: telefono.value || undefined,
    email: email.value || undefined,
    personaContacto: personaContacto.value || undefined,
    direccion: direccion.value || undefined,
    localidad: localidad.value || undefined,
    provincia: provincia.value || undefined,
    codigoPostal: codigoPostal.value || undefined,
    observaciones: observaciones.value || undefined,
    imagen: imagen.value,
    activo: activo.value
  };

  const resultado = proveedorSchema.safeParse(formValues);

  if (!resultado.success) {
    const fieldErrors = resultado.error.flatten().fieldErrors;
    for (const key in fieldErrors) {
      errores.value[key] = fieldErrors[key]?.[0];
    }
    return;
  }

  const dto = {
    ...formValues,
    eliminarImagen: eliminarImagen.value
  };

  let ok = false;

  if (modoEdicion.value && proveedorEditando.value) {
    ok = await store.editProveedor(proveedorEditando.value, dto);
  } else {
    ok = await store.addProveedor(dto);
  }

  if (ok) cerrarModal();
};

const abrirConfirmacion = (id: number) => {
  proveedorAEliminar.value = id;
  openDeleteModal.value = true;
};

const cerrarConfirmacion = () => {
  openDeleteModal.value = false;
};

const confirmarEliminacion = async () => {
  if (!proveedorAEliminar.value) return;

  const ok = await store.removeProveedor(proveedorAEliminar.value);
  if (ok) cerrarConfirmacion();
};

const desactivar = async (id: number) => {
  await store.desactivar(id);
};

const activar = async (id: number) => {
  await store.activar(id);
};

const quitarImagen = () => {
  preview.value = null;
  imagen.value = null;
  eliminarImagen.value = true;
};

const buscarCuentaCorriente = async () => {
  if (!proveedorCuentaCorriente.value) return;
  if (!cuentaCorrienteDesde.value || !cuentaCorrienteHasta.value) return;

  const desdeDate = new Date(`${cuentaCorrienteDesde.value}T00:00:00`);
  const hastaDate = new Date(`${cuentaCorrienteHasta.value}T23:59:59`);

  if (Number.isNaN(desdeDate.getTime()) || Number.isNaN(hastaDate.getTime())) {
    notification.show("Las fechas ingresadas no son validas", "error");
    return;
  }

  if (desdeDate > hastaDate) {
    notification.show("La fecha 'desde' no puede ser mayor que 'hasta'", "error");
    return;
  }

  await comprasStore.fetchCompras(cuentaCorrienteDesde.value, cuentaCorrienteHasta.value);
};

const abrirCuentaCorriente = async (proveedor: Proveedor) => {
  proveedorCuentaCorriente.value = proveedor;
  pagoCuentaCorriente.value = { idFormaPago: 0, importe: 0 };
  openCuentaCorrienteModal.value = true;
  await buscarCuentaCorriente();
};

const cerrarCuentaCorriente = () => {
  openCuentaCorrienteModal.value = false;
  proveedorCuentaCorriente.value = null;
  pagoCuentaCorriente.value = { idFormaPago: 0, importe: 0 };
};

const nombreFormaPago = (idFormaPago: number) => {
  const forma = formasDePagoStore.formasDePago.find((item) => item.id === idFormaPago);
  return forma?.nombre || `Forma #${idFormaPago}`;
};

const usarSaldoPendienteProveedor = () => {
  pagoCuentaCorriente.value.importe = saldoProveedorSeleccionado.value;
};

const guardarPagoCuentaCorriente = async () => {
  if (!proveedorCuentaCorriente.value) return;

  const { idFormaPago, importe } = pagoCuentaCorriente.value;
  if (idFormaPago <= 0) return notification.show("Debe seleccionar una forma de pago", "error");
  if (importe <= 0) return notification.show("El importe debe ser mayor a 0", "error");

  const ok = await comprasStore.registrarPagoProveedor({
    idProveedor: proveedorCuentaCorriente.value.id,
    importe,
    idFormaPago
  });

  if (!ok) return;

  pagoCuentaCorriente.value = { idFormaPago: 0, importe: 0 };
  await buscarCuentaCorriente();
};
</script>
