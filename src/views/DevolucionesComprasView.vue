<template>
  <div class="p-6">
    <h1 class="mb-4 text-2xl font-bold">Devoluciones de compras</h1>

    <div class="mb-4 grid grid-cols-1 gap-3 rounded-xl bg-white p-4 shadow md:grid-cols-2">
      <div>
        <label class="text-sm text-gray-600">Desde</label>
        <input
          v-model="desde"
          type="date"
          :max="hasta || undefined"
          class="w-full rounded-md border px-3 py-2"
          @blur="buscarDevoluciones"
        />
      </div>
      <div>
        <label class="text-sm text-gray-600">Hasta</label>
        <input
          v-model="hasta"
          type="date"
          :min="desde || undefined"
          class="w-full rounded-md border px-3 py-2"
          @blur="buscarDevoluciones"
        />
      </div>
    </div>

    <div class="mb-4 flex justify-end">
      <button @click="abrirCrear" class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
        + Nueva devolucion
      </button>
    </div>

    <table class="w-full rounded bg-white shadow">
      <thead>
        <tr class="border-b text-left">
          <th class="p-2">Fecha</th>
          <th class="p-2">Compra</th>
          <th class="p-2">Proveedor</th>
          <th class="p-2">Motivo</th>
          <th class="p-2 text-right">Total</th>
          <th class="p-2">Estado</th>
          <th class="p-2 text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="d in devolucionesPaginadas" :key="d.id" class="border-b hover:bg-gray-50">
          <td class="p-2">{{ formatDate(d.fecha) }}</td>
          <td class="p-2">{{ compraLabel(d.idCompra) }}</td>
          <td class="p-2">{{ nombreProveedor(d.idProveedor) }}</td>
          <td class="p-2">{{ d.motivo || "-" }}</td>
          <td class="p-2 text-right">{{ money(d.total) }}</td>
          <td class="p-2">
            <span :class="d.estado === 1 ? 'text-green-600' : 'text-slate-500'">
              {{ d.estado === 1 ? "Activa" : "Inactiva" }}
            </span>
          </td>
          <td class="p-2 text-right">
            <button type="button" @click.stop="verDetalle(d.id)" class="cursor-pointer text-blue-500 hover:text-blue-700">
              Ver
            </button>
          </td>
        </tr>
        <tr v-if="!devolucionesFiltradas.length && !loading">
          <td colspan="7" class="p-4 text-center text-sm text-gray-500">No hay devoluciones en el rango seleccionado.</td>
        </tr>
      </tbody>
    </table>

    <div class="mt-4 flex items-center justify-center gap-2">
      <button @click="page--" :disabled="page === 1" class="rounded bg-gray-200 px-3 py-1 disabled:opacity-50">
        &larr;
      </button>
      <span class="text-sm">Pagina {{ page }} de {{ totalPaginas }}</span>
      <button
        @click="page++"
        :disabled="page === totalPaginas"
        class="rounded bg-gray-200 px-3 py-1 disabled:opacity-50"
      >
        &rarr;
      </button>
    </div>

    <div v-if="openModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div class="flex h-[95vh] max-h-[95vh] w-full max-w-6xl flex-col rounded-xl bg-white shadow-xl">
        <div class="rounded-t-xl border-b bg-gray-50 px-6 py-4">
          <h2 class="text-lg font-bold text-gray-800">Nueva devolucion de compra</h2>
        </div>

        <div class="flex-1 space-y-5 overflow-y-auto p-6">
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div ref="compraBox" class="relative">
              <label class="text-sm text-gray-700">Compra *</label>
              <div class="relative">
                <input
                  v-model="compraSearch"
                  class="w-full rounded-md border px-3 py-2 pr-8"
                  placeholder="Buscar por comprobante, proveedor o fecha"
                  @focus="compraOpen = true"
                />
                <button
                  v-if="form.idCompra > 0 || compraSearch"
                  type="button"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-gray-700"
                  @click="limpiarCompra"
                >
                  x
                </button>
              </div>
              <div
                v-if="compraOpen && comprasFiltradasBusqueda.length"
                class="absolute z-20 mt-1 max-h-44 w-full overflow-y-auto rounded-md border bg-white shadow"
              >
                <button
                  v-for="c in comprasFiltradasBusqueda"
                  :key="c.id"
                  type="button"
                  class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                  @click="seleccionarCompra(c)"
                >
                  {{ compraSearchLabel(c) }}
                </button>
              </div>
            </div>

            <div>
              <label class="text-sm text-gray-700">Proveedor *</label>
              <input :value="proveedorSearch" class="w-full rounded-md border bg-gray-50 px-3 py-2" readonly />
            </div>
          </div>

          <div>
            <label class="text-sm text-gray-700">Motivo</label>
            <textarea v-model="form.motivo" rows="2" class="w-full rounded-md border px-3 py-2"></textarea>
          </div>

          <div class="rounded-lg border bg-gray-50/50 p-4">
            <h3 class="mb-2 font-semibold text-gray-800">Detalle de la compra seleccionada</h3>
            <div v-if="!form.idCompra" class="rounded-md border bg-white px-3 py-3 text-sm text-gray-500">
              Selecciona una compra para cargar cantidades a devolver.
            </div>
            <div v-else class="overflow-x-auto rounded-md border bg-white">
              <table class="w-full min-w-[760px]">
                <thead class="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  <tr>
                    <th class="px-3 py-2">Producto</th>
                    <th class="px-3 py-2 text-right">Cant. comprada</th>
                    <th class="px-3 py-2 text-right">Precio unitario</th>
                    <th class="px-3 py-2 text-right">Cantidad a devolver</th>
                    <th class="px-3 py-2 text-right">Subtotal devolucion</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="d in detallesCompraActual" :key="d.idProducto" class="border-t">
                    <td class="px-3 py-2">{{ d.productoNombre }}</td>
                    <td class="px-3 py-2 text-right">{{ d.cantidadComprada }}</td>
                    <td class="px-3 py-2 text-right">{{ money(d.precioUnitario) }}</td>
                    <td class="px-3 py-2 text-right">
                      <input
                        v-model.number="d.cantidadDevolver"
                        type="number"
                        min="0"
                        :max="d.cantidadComprada"
                        class="w-24 rounded-md border px-2 py-1 text-right"
                      />
                    </td>
                    <td class="px-3 py-2 text-right">{{ money((d.cantidadDevolver || 0) * d.precioUnitario) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="rounded-lg border p-3">
            <div class="mb-2 flex items-center justify-between">
              <h3 class="font-semibold">Pagos de devolucion (opcional)</h3>
              <div class="flex items-center gap-3">
                <label class="flex items-center gap-1 text-sm">
                  <input type="checkbox" v-model="pagarTodo" @change="togglePagarTodo" />
                  Pagar todo
                </label>
                <button @click="agregarPago" class="text-sm text-blue-600" :disabled="pagarTodo">+ Agregar pago</button>
              </div>
            </div>
            <div class="space-y-2">
              <div v-for="(p, idx) in form.pagos" :key="idx" class="grid grid-cols-1 gap-2 md:grid-cols-4">
                <select v-model.number="p.idFormaPago" class="rounded-md border px-3 py-2">
                  <option :value="0">Forma de pago</option>
                  <option v-for="f in formasDePago" :key="f.id" :value="f.id">{{ f.nombre }}</option>
                </select>
                <input
                  v-if="pagarTodo"
                  :value="money(p.importe)"
                  type="text"
                  readonly
                  class="rounded-md border bg-gray-50 px-3 py-2"
                />
                <input
                  v-else
                  v-model.number="p.importe"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Importe"
                  class="rounded-md border px-3 py-2"
                />
                <input v-model="p.referencia" maxlength="120" placeholder="Referencia" class="rounded-md border px-3 py-2" />
                <button @click="quitarPago(idx)" class="rounded-md bg-red-100 px-3 py-2 text-red-600">Quitar</button>
              </div>
            </div>
          </div>

          <div class="text-right font-semibold">Total devolucion: {{ money(totalCalculado) }}</div>
        </div>

        <div class="flex justify-end gap-2 rounded-b-xl border-t bg-gray-50 px-6 py-4">
          <button @click="cerrarModal" class="rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300">Cancelar</button>
          <button
            @click="guardarDevolucion"
            class="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            :disabled="saving"
          >
            {{ saving ? "Guardando..." : "Guardar" }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="openDetalleModal && devolucionDetalle" class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div class="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
        <h2 class="mb-4 text-lg font-bold">Detalle devolucion compra #{{ devolucionDetalle.id }}</h2>
        <div class="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <p><b>Fecha:</b> {{ formatDate(devolucionDetalle.fecha) }}</p>
          <p><b>Compra:</b> {{ compraLabel(devolucionDetalle.idCompra) }}</p>
          <p><b>Proveedor:</b> {{ nombreProveedor(devolucionDetalle.idProveedor) }}</p>
          <p><b>Motivo:</b> {{ devolucionDetalle.motivo || "-" }}</p>
          <p><b>Estado:</b> {{ devolucionDetalle.estado === 1 ? "Activa" : "Inactiva" }}</p>
          <p><b>Total:</b> {{ money(devolucionDetalle.total) }}</p>
        </div>

        <h3 class="mb-2 mt-5 font-semibold">Productos devueltos</h3>
        <div class="overflow-x-auto rounded-md border">
          <table class="w-full min-w-[640px] bg-white">
            <thead class="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              <tr>
                <th class="px-3 py-2">Producto</th>
                <th class="px-3 py-2 text-right">Cantidad</th>
                <th class="px-3 py-2 text-right">Precio unitario</th>
                <th class="px-3 py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in devolucionDetalle.detalles || []" :key="idx" class="border-t">
                <td class="px-3 py-2">{{ nombreProducto(item.idProducto) }}</td>
                <td class="px-3 py-2 text-right">{{ item.cantidad }}</td>
                <td class="px-3 py-2 text-right">{{ money(item.precioUnitario) }}</td>
                <td class="px-3 py-2 text-right">{{ money(item.subtotal) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t bg-gray-50 font-semibold">
                <td class="px-3 py-2 text-right" colspan="3">Total</td>
                <td class="px-3 py-2 text-right">{{ money(devolucionDetalle.total) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <h3 class="mb-2 mt-5 font-semibold">Pagos</h3>
        <div class="overflow-x-auto rounded-md border">
          <table class="w-full min-w-[640px] bg-white">
            <thead class="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              <tr>
                <th class="px-3 py-2">Forma de pago</th>
                <th class="px-3 py-2 text-right">Importe</th>
                <th class="px-3 py-2">Referencia</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, idx) in devolucionDetalle.pagos || []" :key="idx" class="border-t">
                <td class="px-3 py-2">{{ nombreFormaPago(p.idFormaPago) }}</td>
                <td class="px-3 py-2 text-right">{{ money(p.importe) }}</td>
                <td class="px-3 py-2">{{ p.referencia || "-" }}</td>
              </tr>
              <tr v-if="!(devolucionDetalle.pagos || []).length" class="border-t">
                <td colspan="3" class="px-3 py-3 text-sm text-gray-500">Sin pagos registrados.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-5 flex justify-end">
          <button @click="cerrarDetalleModal" class="cursor-pointer rounded bg-gray-200 px-4 py-2 hover:bg-gray-300">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { obtenerCompraPorId, obtenerComprasPorEstado } from "@/modules/compras/services";
import type { Compra } from "@/modules/compras/types";
import { crearDevolucionCompra, obtenerDevolucionCompraPorId, obtenerDevolucionesComprasEntreFechas } from "@/modules/devolucionesCompras/services";
import type { DevolucionCompra } from "@/modules/devolucionesCompras/types";
import { obtenerFormasDePago } from "@/modules/formasDePagos/services";
import type { FormaDePago } from "@/modules/formasDePagos/types";
import { obtenerProductos } from "@/modules/productos/services";
import type { Producto } from "@/modules/productos/types";
import { obtenerProveedores } from "@/modules/proveedores/services";
import type { Proveedor } from "@/modules/proveedores/types";
import { useNotificationStore } from "@/stores/notificaciones";

type PagoForm = { idFormaPago: number; importe: number; referencia: string };
type DetalleEditable = {
  idProducto: number;
  productoNombre: string;
  cantidadComprada: number;
  precioUnitario: number;
  cantidadDevolver: number;
};

const notification = useNotificationStore();

const hoy = new Date();
const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

const desde = ref(toInputDate(primerDiaMes));
const hasta = ref(toInputDate(hoy));
const page = ref(1);
const pageSize = 10;
const loading = ref(false);
const saving = ref(false);

const proveedores = ref<Proveedor[]>([]);
const productos = ref<Producto[]>([]);
const formasDePago = ref<FormaDePago[]>([]);
const compras = ref<Compra[]>([]);
const devoluciones = ref<DevolucionCompra[]>([]);
const devolucionesFiltradas = ref<DevolucionCompra[]>([]);

const openModal = ref(false);
const openDetalleModal = ref(false);
const devolucionDetalle = ref<DevolucionCompra | null>(null);
const compraOpen = ref(false);
const compraSearch = ref("");
const proveedorSearch = ref("");
const compraBox = ref<HTMLElement | null>(null);
const pagarTodo = ref(false);
const form = ref({
  idCompra: 0,
  idProveedor: 0,
  motivo: "",
  pagos: [] as PagoForm[],
});
const detallesCompraActual = ref<DetalleEditable[]>([]);

const totalPaginas = computed(() => Math.max(1, Math.ceil(devolucionesFiltradas.value.length / pageSize)));
const devolucionesPaginadas = computed(() =>
  devolucionesFiltradas.value.slice((page.value - 1) * pageSize, page.value * pageSize),
);
const comprasFiltradasBusqueda = computed(() =>
  compras.value
    .filter((c) => compraSearchLabel(c).toLowerCase().includes(compraSearch.value.toLowerCase()))
    .slice(0, 8),
);
const detallesCalculados = computed(() => detallesCompraActual.value.filter((d) => (d.cantidadDevolver || 0) > 0));
const totalCalculado = computed(() =>
  detallesCalculados.value.reduce((acc, d) => acc + d.cantidadDevolver * d.precioUnitario, 0),
);

function toInputDate(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toApiDateTime(date: string, endOfDay = false) {
  return `${date}T${endOfDay ? "23:59:59" : "00:00:00"}`;
}

function formatDate(value: string) {
  return value ? new Date(value).toLocaleDateString("es-AR") : "-";
}

function money(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(value || 0);
}

function nombreProveedor(idProveedor: number) {
  return proveedores.value.find((x) => x.id === idProveedor)?.razonSocial || `Proveedor #${idProveedor}`;
}

function nombreProducto(idProducto: number) {
  return productos.value.find((p) => p.id === idProducto)?.nombre || `Producto #${idProducto}`;
}

function nombreFormaPago(idFormaPago: number) {
  return formasDePago.value.find((f) => f.id === idFormaPago)?.nombre || `Forma #${idFormaPago}`;
}

function compraLabel(idCompra: number) {
  return compras.value.find((c) => c.id === idCompra)?.numeroComprobante || `#${idCompra}`;
}

function compraSearchLabel(c: Compra) {
  return `${c.numeroComprobante} - ${nombreProveedor(c.idProveedor)} - ${formatDate(c.fecha)}`;
}

async function cargarCatalogos() {
  const [proveedoresData, productosData, formasData, comprasData] = await Promise.all([
    obtenerProveedores(true),
    obtenerProductos(true),
    obtenerFormasDePago(),
    obtenerComprasPorEstado(1),
  ]);

  proveedores.value = proveedoresData;
  productos.value = productosData;
  formasDePago.value = formasData;
  compras.value = comprasData;
}

async function buscarDevoluciones() {
  const d = new Date(`${desde.value}T00:00:00`);
  const h = new Date(`${hasta.value}T23:59:59`);
  if (d > h) {
    notification.show("La fecha 'desde' no puede ser mayor que 'hasta'", "error");
    return;
  }

  loading.value = true;
  try {
    const data = await obtenerDevolucionesComprasEntreFechas(toApiDateTime(desde.value), toApiDateTime(hasta.value, true));
    devoluciones.value = data;
    devolucionesFiltradas.value = data;
    page.value = 1;
  } catch (err: any) {
    const message =
      err.response?.data?.error ||
      err.response?.data?.Error ||
      "No se pudieron cargar las devoluciones de compras";
    notification.show(message, "error");
  } finally {
    loading.value = false;
  }
}

function abrirCrear() {
  form.value = { idCompra: 0, idProveedor: 0, motivo: "", pagos: [] };
  compraSearch.value = "";
  proveedorSearch.value = "";
  detallesCompraActual.value = [];
  pagarTodo.value = false;
  openModal.value = true;
}

function cerrarModal() {
  openModal.value = false;
}

async function seleccionarCompra(compra: Compra) {
  try {
    const compraDetalle = await obtenerCompraPorId(compra.id);
    form.value.idCompra = compraDetalle.id;
    form.value.idProveedor = compraDetalle.idProveedor;
    compraSearch.value = compraSearchLabel(compraDetalle);
    proveedorSearch.value = nombreProveedor(compraDetalle.idProveedor);
    detallesCompraActual.value = (compraDetalle.detalles || []).map((detalle) => {
      return {
        idProducto: detalle.idProducto,
        productoNombre: nombreProducto(detalle.idProducto),
        cantidadComprada: Math.max(0, detalle.cantidad),
        precioUnitario: detalle.precioUnitario,
        cantidadDevolver: 0,
      };
    });
    compraOpen.value = false;
  } catch (err: any) {
    const message =
      err.response?.data?.error ||
      err.response?.data?.Error ||
      "No se pudo cargar el detalle de la compra";
    notification.show(message, "error");
  }
}

function limpiarCompra() {
  form.value.idCompra = 0;
  form.value.idProveedor = 0;
  compraSearch.value = "";
  proveedorSearch.value = "";
  detallesCompraActual.value = [];
}

function agregarPago() {
  form.value.pagos.push({ idFormaPago: 0, importe: 0, referencia: "" });
}

function quitarPago(idx: number) {
  form.value.pagos.splice(idx, 1);
}

function togglePagarTodo() {
  if (pagarTodo.value) {
    form.value.pagos = [{ idFormaPago: 0, importe: totalCalculado.value, referencia: "Pago total" }];
    return;
  }

  form.value.pagos = [];
}

async function guardarDevolucion() {
  if (!form.value.idCompra) {
    notification.show("Selecciona una compra", "error");
    return;
  }

  if (!detallesCalculados.value.length) {
    notification.show("Indica al menos una cantidad a devolver", "error");
    return;
  }

  if (pagarTodo.value && form.value.pagos.length) {
    form.value.pagos[0].importe = totalCalculado.value;
  }

  const pagosSinForma = form.value.pagos.some((p) => p.importe > 0 && p.idFormaPago <= 0);
  if (pagosSinForma) {
    notification.show("Todos los pagos con importe deben tener forma de pago seleccionada", "error");
    return;
  }

  const pagosValidos = form.value.pagos.filter((p) => p.idFormaPago > 0 && p.importe > 0);
  const totalPagado = pagosValidos.reduce((acc, p) => acc + p.importe, 0);

  if (totalPagado > totalCalculado.value) {
    notification.show("Los pagos no pueden superar el total de la devolucion", "error");
    return;
  }

  saving.value = true;
  try {
    const response = await crearDevolucionCompra({
      idCompra: form.value.idCompra,
      idProveedor: form.value.idProveedor,
      motivo: form.value.motivo || undefined,
      detalles: detallesCalculados.value.map((d) => ({
        idProducto: d.idProducto,
        cantidad: d.cantidadDevolver,
      })),
      pagos: pagosValidos.length
        ? pagosValidos.map((p) => ({
            idFormaPago: p.idFormaPago,
            importe: p.importe,
          }))
        : undefined,
    });

    await buscarDevoluciones();
    openModal.value = false;
    notification.show(response.mensaje || response.Mensaje || "Devolucion de compra registrada correctamente", "success");
  } catch (err: any) {
    const message =
      err.response?.data?.error ||
      err.response?.data?.Error ||
      "No se pudo registrar la devolucion de compra";
    notification.show(message, "error");
  } finally {
    saving.value = false;
  }
}

async function verDetalle(id: number) {
  try {
    devolucionDetalle.value = await obtenerDevolucionCompraPorId(id);
    openDetalleModal.value = true;
  } catch (err: any) {
    const message =
      err.response?.data?.error ||
      err.response?.data?.Error ||
      err.response?.data?.mensaje ||
      err.response?.data?.Mensaje ||
      "No se pudo cargar la devolucion";
    notification.show(message, "error");
  }
}

function cerrarDetalleModal() {
  openDetalleModal.value = false;
  devolucionDetalle.value = null;
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node;
  if (compraBox.value && !compraBox.value.contains(target)) {
    compraOpen.value = false;
  }
}

onMounted(async () => {
  document.addEventListener("click", handleClickOutside);
  try {
    await cargarCatalogos();
    await buscarDevoluciones();
  } catch (err: any) {
    const message =
      err.response?.data?.error ||
      err.response?.data?.Error ||
      "No se pudieron cargar los datos iniciales";
    notification.show(message, "error");
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
