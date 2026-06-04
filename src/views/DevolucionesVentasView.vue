<template>
  <div class="p-6">
    <h1 class="mb-4 text-2xl font-bold">Devoluciones de ventas</h1>

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
          <th class="p-2">Comprobante</th>
          <th class="p-2">Venta</th>
          <th class="p-2">Cliente</th>
          <th class="p-2 text-right">Total</th>
          <th class="p-2">Estado</th>
          <th class="p-2 text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="7" class="p-4 text-center text-sm text-gray-500">Cargando devoluciones...</td>
        </tr>
        <tr v-for="d in devolucionesPaginadas" :key="d.id" class="border-b hover:bg-gray-50">
          <td class="p-2">{{ formatDate(d.fecha) }}</td>
          <td class="p-2">{{ d.numeroComprobante || "-" }}</td>
          <td class="p-2">{{ ventaLabel(d.idVenta) }}</td>
          <td class="p-2">{{ nombreCliente(d.idCliente) }}</td>
          <td class="p-2 text-right">{{ money(d.total) }}</td>
          <td class="p-2">
            <span :class="estadoClass(d.estado)">
              {{ estadoLabel(d.estado) }}
            </span>
          </td>
          <td class="p-2 text-right">
            <button type="button" @click.stop="verDetalle(d.id)" class="cursor-pointer text-blue-500 hover:text-blue-700">
              Ver
            </button>
          </td>
        </tr>
        <tr v-if="!loading && !devolucionesFiltradas.length">
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
          <h2 class="text-lg font-bold text-gray-800">Nueva devolucion</h2>
        </div>

        <div class="flex-1 space-y-5 overflow-y-auto p-6">
          <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <label class="text-sm text-gray-700">Nro. comprobante *</label>
              <input v-model="form.numeroComprobante" class="w-full rounded-md border px-3 py-2" />
            </div>

            <div ref="ventaBox" class="relative">
              <label class="text-sm text-gray-700">Venta *</label>
              <div class="relative">
                <input
                  v-model="ventaSearch"
                  class="w-full rounded-md border px-3 py-2 pr-8"
                  placeholder="Buscar por comprobante, cliente o fecha"
                  @focus="ventaOpen = true"
                />
                <button
                  v-if="form.idVenta > 0 || ventaSearch"
                  type="button"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-gray-700"
                  @click="limpiarVenta"
                >
                  x
                </button>
              </div>
              <div
                v-if="ventaOpen && ventasFiltradasBusqueda.length"
                class="absolute z-20 mt-1 max-h-44 w-full overflow-y-auto rounded-md border bg-white shadow"
              >
                <button
                  v-for="v in ventasFiltradasBusqueda"
                  :key="v.id"
                  type="button"
                  class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                  @click="seleccionarVenta(v)"
                >
                  {{ ventaSearchLabel(v) }}
                </button>
              </div>
            </div>

            <div>
              <label class="text-sm text-gray-700">Cliente *</label>
              <input :value="clienteSearch" class="w-full rounded-md border bg-gray-50 px-3 py-2" readonly />
            </div>
          </div>

          <div>
            <label class="text-sm text-gray-700">Observaciones</label>
            <textarea v-model="form.observaciones" rows="2" class="w-full rounded-md border px-3 py-2"></textarea>
          </div>

          <div class="rounded-lg border bg-gray-50/50 p-4">
            <h3 class="mb-2 font-semibold text-gray-800">Detalle de la venta seleccionada</h3>
            <div v-if="!form.idVenta" class="rounded-md border bg-white px-3 py-3 text-sm text-gray-500">
              Selecciona una venta para cargar cantidades a devolver.
            </div>
            <div v-else class="overflow-x-auto rounded-md border bg-white">
              <table class="w-full min-w-[760px]">
                <thead class="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  <tr>
                    <th class="px-3 py-2">Producto</th>
                    <th class="px-3 py-2 text-right">Cant. vendida</th>
                    <th class="px-3 py-2 text-right">Precio unitario</th>
                    <th class="px-3 py-2 text-right">Cantidad a devolver</th>
                    <th class="px-3 py-2 text-right">Subtotal devolucion</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="d in detallesVentaActual" :key="d.idVentaDetalle" class="border-t">
                    <td class="px-3 py-2">{{ d.productoNombre }}</td>
                    <td class="px-3 py-2 text-right">{{ d.cantidadVendida }}</td>
                    <td class="px-3 py-2 text-right">{{ money(d.precioUnitario) }}</td>
                    <td class="px-3 py-2 text-right">
                      <input
                        v-model.number="d.cantidadDevolver"
                        type="number"
                        min="0"
                        :max="d.cantidadVendida"
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
        <h2 class="mb-4 text-lg font-bold">Detalle devolucion #{{ devolucionDetalle.id }}</h2>
        <div class="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <p><b>Comprobante:</b> {{ devolucionDetalle.numeroComprobante || "-" }}</p>
          <p><b>Fecha:</b> {{ formatDate(devolucionDetalle.fecha) }}</p>
          <p><b>Venta:</b> {{ ventaLabel(devolucionDetalle.idVenta) }}</p>
          <p><b>Cliente:</b> {{ nombreCliente(devolucionDetalle.idCliente) }}</p>
          <p><b>Estado:</b> {{ estadoLabel(devolucionDetalle.estado) }}</p>
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
import { obtenerClientes } from "@/modules/clientes/services";
import type { Cliente } from "@/modules/clientes/types";
import {
  crearDevolucionVenta,
  obtenerDevolucionVentaPorId,
  obtenerDevolucionesVentasEntreFechas,
} from "@/modules/devolucionesVentas/services";
import type { DevolucionVenta } from "@/modules/devolucionesVentas/types";
import { obtenerFormasDePago } from "@/modules/formasDePagos/services";
import type { FormaDePago } from "@/modules/formasDePagos/types";
import { obtenerProductos } from "@/modules/productos/services";
import type { Producto } from "@/modules/productos/types";
import { useNotificationStore } from "@/stores/notificaciones";
import { obtenerVentaPorId, obtenerVentasPorEstado } from "@/modules/ventas/services";
import type { Venta } from "@/modules/ventas/types";

type PagoForm = { idFormaPago: number; importe: number; referencia: string };
type DetalleEditable = {
  idVentaDetalle: number;
  idProducto: number;
  productoNombre: string;
  cantidadVendida: number;
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

const clientes = ref<Cliente[]>([]);
const productos = ref<Producto[]>([]);
const formasDePago = ref<FormaDePago[]>([]);
const ventas = ref<Venta[]>([]);
const devoluciones = ref<DevolucionVenta[]>([]);
const devolucionesFiltradas = ref<DevolucionVenta[]>([]);

const openModal = ref(false);
const openDetalleModal = ref(false);
const devolucionDetalle = ref<DevolucionVenta | null>(null);
const ventaOpen = ref(false);
const ventaSearch = ref("");
const clienteSearch = ref("");
const ventaBox = ref<HTMLElement | null>(null);
const pagarTodo = ref(false);
const form = ref({
  idVenta: 0,
  numeroComprobante: "",
  idCliente: 0,
  observaciones: "",
  pagos: [] as PagoForm[],
});
const detallesVentaActual = ref<DetalleEditable[]>([]);

const totalPaginas = computed(() => Math.max(1, Math.ceil(devolucionesFiltradas.value.length / pageSize)));
const devolucionesPaginadas = computed(() =>
  devolucionesFiltradas.value.slice((page.value - 1) * pageSize, page.value * pageSize),
);
const ventasFiltradasBusqueda = computed(() =>
  ventas.value
    .filter((venta) => ventaSearchLabel(venta).toLowerCase().includes(ventaSearch.value.toLowerCase()))
    .slice(0, 8),
);
const detallesCalculados = computed(() => detallesVentaActual.value.filter((detalle) => (detalle.cantidadDevolver || 0) > 0));
const totalCalculado = computed(() =>
  detallesCalculados.value.reduce((acc, detalle) => acc + detalle.cantidadDevolver * detalle.precioUnitario, 0),
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

function nombreCliente(idCliente: number) {
  return clientes.value.find((cliente) => cliente.id === idCliente)?.nombreCompleto || `Cliente #${idCliente}`;
}

function nombreProducto(idProducto: number) {
  return productos.value.find((producto) => producto.id === idProducto)?.nombre || `Producto #${idProducto}`;
}

function nombreFormaPago(idFormaPago: number) {
  return formasDePago.value.find((forma) => forma.id === idFormaPago)?.nombre || `Forma #${idFormaPago}`;
}

function ventaLabel(idVenta: number) {
  return ventas.value.find((venta) => venta.id === idVenta)?.numeroComprobante || `#${idVenta}`;
}

function ventaSearchLabel(venta: Venta) {
  return `${venta.numeroComprobante} - ${nombreCliente(venta.idCliente)} - ${formatDate(venta.fecha)}`;
}

function estadoLabel(estado: string | number | null | undefined) {
  const normalizado = String(estado ?? "").trim().toLowerCase();
  if (normalizado === "1" || normalizado === "activa") return "Activa";
  if (normalizado === "0" || normalizado === "inactiva") return "Inactiva";
  if (normalizado === "2" || normalizado === "anulada") return "Anulada";
  return estado ? String(estado) : "-";
}

function estadoClass(estado: string | number | null | undefined) {
  const label = estadoLabel(estado);
  if (label === "Activa") return "text-green-600";
  if (label === "Anulada") return "text-red-600";
  return "text-slate-500";
}

async function cargarCatalogos() {
  const [clientesData, productosData, formasData] = await Promise.all([
    obtenerClientes(true),
    obtenerProductos(true),
    obtenerFormasDePago(),
  ]);

  clientes.value = clientesData;
  productos.value = productosData;
  formasDePago.value = formasData;
}

async function cargarVentasDisponibles() {
  ventas.value = await obtenerVentasPorEstado(1);
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
    const devolucionesData = await obtenerDevolucionesVentasEntreFechas(
      toApiDateTime(desde.value),
      toApiDateTime(hasta.value, true),
    );

    devoluciones.value = devolucionesData;
    devolucionesFiltradas.value = devolucionesData;
    page.value = 1;
  } catch (err: any) {
    const message =
      err.response?.data?.error ||
      err.response?.data?.Error ||
      "No se pudieron cargar las devoluciones de ventas";
    notification.show(message, "error");
  } finally {
    loading.value = false;
  }
}

function abrirCrear() {
  form.value = { idVenta: 0, numeroComprobante: "", idCliente: 0, observaciones: "", pagos: [] };
  ventaSearch.value = "";
  clienteSearch.value = "";
  detallesVentaActual.value = [];
  pagarTodo.value = false;
  openModal.value = true;
}

function cerrarModal() {
  openModal.value = false;
}

async function seleccionarVenta(venta: Venta) {
  try {
    const ventaDetalle = await obtenerVentaPorId(venta.id);
    form.value.idVenta = ventaDetalle.id;
    form.value.idCliente = ventaDetalle.idCliente;
    ventaSearch.value = ventaSearchLabel(ventaDetalle);
    clienteSearch.value = nombreCliente(ventaDetalle.idCliente);
    detallesVentaActual.value = (ventaDetalle.detalles || [])
      .map((detalle) => ({
        idVentaDetalle: detalle.id ?? 0,
        idProducto: detalle.idProducto,
        productoNombre: nombreProducto(detalle.idProducto),
        cantidadVendida: Math.max(0, detalle.cantidad),
        precioUnitario: detalle.precioUnitario,
        cantidadDevolver: 0,
      }))
      .filter((detalle) => detalle.idVentaDetalle > 0);

    if (!detallesVentaActual.value.length) {
      notification.show("La venta seleccionada no tiene detalles disponibles para devolver", "error");
      return;
    }

    ventaOpen.value = false;
  } catch (err: any) {
    const message =
      err.response?.data?.error ||
      err.response?.data?.Error ||
      "No se pudo cargar el detalle de la venta";
    notification.show(message, "error");
  }
}

function limpiarVenta() {
  form.value.idVenta = 0;
  form.value.idCliente = 0;
  ventaSearch.value = "";
  clienteSearch.value = "";
  detallesVentaActual.value = [];
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
  if (!form.value.idVenta) {
    notification.show("Selecciona una venta", "error");
    return;
  }

  if (!form.value.numeroComprobante.trim()) {
    notification.show("Comprobante obligatorio", "error");
    return;
  }

  if (!detallesCalculados.value.length) {
    notification.show("Indica al menos una cantidad a devolver", "error");
    return;
  }

  if (pagarTodo.value && form.value.pagos.length) {
    const primerPago = form.value.pagos[0];
    if (primerPago) {
      primerPago.importe = totalCalculado.value;
    }
  }

  const pagoSinForma = form.value.pagos.some((pago) => pago.importe > 0 && pago.idFormaPago <= 0);
  if (pagoSinForma) {
    notification.show("Todos los pagos con importe deben tener forma de pago seleccionada", "error");
    return;
  }

  const pagosValidos = form.value.pagos.filter((pago) => pago.idFormaPago > 0 && pago.importe > 0);
  const totalPagado = pagosValidos.reduce((acc, pago) => acc + pago.importe, 0);
  if (totalPagado > totalCalculado.value) {
    notification.show("Los pagos no pueden superar el total de la devolucion", "error");
    return;
  }

  saving.value = true;
  try {
    const response = await crearDevolucionVenta({
      idVenta: form.value.idVenta,
      numeroComprobante: form.value.numeroComprobante.trim(),
      idCliente: form.value.idCliente,
      observaciones: form.value.observaciones?.trim() || undefined,
      detalles: detallesCalculados.value.map((detalle) => ({
        idVentaDetalle: detalle.idVentaDetalle,
        idProducto: detalle.idProducto,
        cantidad: detalle.cantidadDevolver,
      })),
      pagos: pagosValidos.length
        ? pagosValidos.map((pago) => ({
            idFormaPago: pago.idFormaPago,
            importe: pago.importe,
            referencia: pago.referencia?.trim() || undefined,
          }))
        : undefined,
    });

    await buscarDevoluciones();
    openModal.value = false;
    notification.show(response.mensaje || response.Mensaje || "Devolucion registrada correctamente", "success");
  } catch (err: any) {
    const message =
      err.response?.data?.error ||
      err.response?.data?.Error ||
      "No se pudo registrar la devolucion de venta";
    notification.show(message, "error");
  } finally {
    saving.value = false;
  }
}

async function verDetalle(id: number) {
  try {
    devolucionDetalle.value = await obtenerDevolucionVentaPorId(id);
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
  if (ventaBox.value && !ventaBox.value.contains(target)) {
    ventaOpen.value = false;
  }
}

onMounted(async () => {
  document.addEventListener("click", handleClickOutside);

  try {
    await cargarCatalogos();
    await cargarVentasDisponibles();
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
