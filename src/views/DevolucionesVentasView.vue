<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Devoluciones de ventas</h1>

    <div class="bg-white rounded-xl shadow p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
      <div>
        <label class="text-sm text-gray-600">Desde</label>
        <input v-model="desde" type="date" :max="hasta || undefined" class="w-full border px-3 py-2 rounded-md" @blur="buscarDevoluciones" />
      </div>
      <div>
        <label class="text-sm text-gray-600">Hasta</label>
        <input v-model="hasta" type="date" :min="desde || undefined" class="w-full border px-3 py-2 rounded-md" @blur="buscarDevoluciones" />
      </div>
      <div class="flex items-end">
        <button @click="buscarDevoluciones" class="w-full bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-800">Actualizar</button>
      </div>
    </div>

    <div class="flex justify-end mb-4">
      <button @click="abrirCrear" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">+ Nueva devolución</button>
    </div>

    <table class="w-full bg-white rounded shadow">
      <thead>
        <tr class="text-left border-b">
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
        <tr v-for="d in devolucionesPaginadas" :key="d.id" class="border-b hover:bg-gray-50">
          <td class="p-2">{{ formatDate(d.fecha) }}</td>
          <td class="p-2">{{ d.numeroComprobante }}</td>
          <td class="p-2">{{ ventaLabel(d.idVenta) }}</td>
          <td class="p-2">{{ nombreCliente(d.idCliente) }}</td>
          <td class="p-2 text-right">{{ money(d.total) }}</td>
          <td class="p-2"><span class="text-green-600">{{ d.estado }}</span></td>
          <td class="p-2 text-right"><button type="button" @click.stop="verDetalle(d.id)" class="text-blue-500 hover:text-blue-700 cursor-pointer">Ver</button></td>
        </tr>
      </tbody>
    </table>

    <div class="flex justify-center items-center gap-2 mt-4">
      <button @click="page--" :disabled="page === 1" class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">←</button>
      <span class="text-sm">Página {{ page }} de {{ totalPaginas }}</span>
      <button @click="page++" :disabled="page === totalPaginas" class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">→</button>
    </div>

    <div v-if="openModal" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-xl w-full max-w-6xl shadow-xl max-h-[95vh] h-[95vh] flex flex-col">
        <div class="px-6 py-4 border-b bg-gray-50 rounded-t-xl"><h2 class="text-lg font-bold text-gray-800">Nueva devolución</h2></div>
        <div class="p-6 overflow-y-auto space-y-5 flex-1">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="text-sm text-gray-700">Nro. comprobante *</label>
              <input v-model="form.numeroComprobante" class="w-full border px-3 py-2 rounded-md" />
            </div>
            <div ref="ventaBox" class="relative">
              <label class="text-sm text-gray-700">Venta *</label>
              <div class="relative">
                <input v-model="ventaSearch" class="w-full border px-3 py-2 rounded-md pr-8" placeholder="Buscar por comprobante, cliente o fecha" @focus="ventaOpen = true" />
                <button v-if="form.idVenta > 0 || ventaSearch" type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-sm" @click="limpiarVenta">×</button>
              </div>
              <div v-if="ventaOpen && ventasFiltradasBusqueda.length" class="absolute z-20 w-full mt-1 bg-white border rounded-md shadow max-h-44 overflow-y-auto">
                <button v-for="v in ventasFiltradasBusqueda" :key="v.id" type="button" class="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm" @click="seleccionarVenta(v)">{{ ventaSearchLabel(v) }}</button>
              </div>
            </div>
            <div>
              <label class="text-sm text-gray-700">Cliente *</label>
              <input :value="clienteSearch" class="w-full border px-3 py-2 rounded-md bg-gray-50" readonly />
            </div>
          </div>

          <div>
            <label class="text-sm text-gray-700">Observaciones</label>
            <textarea v-model="form.observaciones" rows="2" class="w-full border px-3 py-2 rounded-md"></textarea>
          </div>

          <div class="border rounded-lg p-4 bg-gray-50/50">
            <h3 class="font-semibold text-gray-800 mb-2">Detalle de la venta seleccionada</h3>
            <div v-if="!form.idVenta" class="text-sm text-gray-500 border rounded-md bg-white px-3 py-3">Seleccioná una venta para cargar cantidades a devolver.</div>
            <div v-else class="overflow-x-auto border rounded-md bg-white">
              <table class="w-full min-w-[760px]">
                <thead class="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  <tr>
                    <th class="px-3 py-2">Producto</th>
                    <th class="px-3 py-2 text-right">Cant. vendida</th>
                    <th class="px-3 py-2 text-right">Precio unitario</th>
                    <th class="px-3 py-2 text-right">Cantidad a devolver</th>
                    <th class="px-3 py-2 text-right">Subtotal devolución</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="d in detallesVentaActual" :key="d.idVentaDetalle" class="border-t">
                    <td class="px-3 py-2">{{ d.productoNombre }}</td>
                    <td class="px-3 py-2 text-right">{{ d.cantidadVendida }}</td>
                    <td class="px-3 py-2 text-right">{{ money(d.precioUnitario) }}</td>
                    <td class="px-3 py-2 text-right">
                      <input v-model.number="d.cantidadDevolver" type="number" min="0" :max="d.cantidadVendida" class="border px-2 py-1 rounded-md w-24 text-right" />
                    </td>
                    <td class="px-3 py-2 text-right">{{ money((d.cantidadDevolver || 0) * d.precioUnitario) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="text-right font-semibold">Total devolución: {{ money(totalCalculado) }}</div>
        </div>
        <div class="px-6 py-4 border-t bg-gray-50 rounded-b-xl flex justify-end gap-2">
          <button @click="cerrarModal" class="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">Cancelar</button>
          <button @click="guardarDevolucion" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Guardar</button>
        </div>
      </div>
    </div>

    <div v-if="openDetalleModal && devolucionDetalle" class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold mb-4">Detalle devolución #{{ devolucionDetalle.id }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <p><b>Comprobante:</b> {{ devolucionDetalle.numeroComprobante }}</p>
          <p><b>Fecha:</b> {{ formatDate(devolucionDetalle.fecha) }}</p>
          <p><b>Venta:</b> {{ ventaLabel(devolucionDetalle.idVenta) }}</p>
          <p><b>Cliente:</b> {{ nombreCliente(devolucionDetalle.idCliente) }}</p>
          <p><b>Estado:</b> {{ devolucionDetalle.estado }}</p>
          <p><b>Total:</b> {{ money(devolucionDetalle.total) }}</p>
        </div>
        <h3 class="font-semibold mt-5 mb-2">Productos devueltos</h3>
        <div class="overflow-x-auto border rounded-md">
          <table class="w-full min-w-[640px] bg-white">
            <thead class="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              <tr>
                <th class="px-3 py-2">Producto</th>
                <th class="px-3 py-2 text-right">Cantidad</th>
                <th class="px-3 py-2 text-right">Precio unitario</th>
                <th class="px-3 py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in (devolucionDetalle.detalles || [])" :key="idx" class="border-t">
                <td class="px-3 py-2">{{ nombreProducto(item.idProducto) }}</td>
                <td class="px-3 py-2 text-right">{{ item.cantidad }}</td>
                <td class="px-3 py-2 text-right">{{ money(item.precioUnitario) }}</td>
                <td class="px-3 py-2 text-right">{{ money(item.subtotal) }}</td>
              </tr>
              <tr v-if="!(devolucionDetalle.detalles || []).length" class="border-t">
                <td colspan="4" class="px-3 py-3 text-sm text-gray-500">Sin productos en esta devolución.</td>
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
        <div class="flex justify-end mt-5">
          <button @click="cerrarDetalleModal" class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 cursor-pointer">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useNotificationStore } from "@/stores/notificaciones";

const notification = useNotificationStore();
const hoy = new Date();
const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
const toInputDate = (d: Date) => d.toISOString().slice(0, 10);
const desde = ref(toInputDate(primerDiaMes));
const hasta = ref(toInputDate(hoy));
const page = ref(1);
const pageSize = 10;

const clientes = ref(Array.from({ length: 20 }, (_, i) => ({ id: i + 1, nombre: `Nombre${i + 1}`, apellido: `Apellido${i + 1}`, documento: `30${10000000 + i}` })));
const productos = ref([{ id: 100, nombre: "Yerba Mate 1kg", precioUnitario: 5600 }, { id: 101, nombre: "Azucar 1kg", precioUnitario: 2100 }, { id: 102, nombre: "Arroz 1kg", precioUnitario: 2300 }]);
const ventas = ref(Array.from({ length: 24 }, (_, i) => ({ id: 900 + i, numeroComprobante: `V-0001-${String(5000 + i).padStart(8, "0")}`, fecha: new Date(hoy.getFullYear(), hoy.getMonth(), (i % 28) + 1).toISOString(), idCliente: (i % 20) + 1 })));
const devoluciones = ref(Array.from({ length: 14 }, (_, i) => {
  const idProducto = 100 + (i % 3);
  const cantidad = 1 + (i % 2);
  const precioUnitario = 2500 + i * 100;
  return {
    id: i + 1,
    idVenta: ventas.value[i].id,
    numeroComprobante: `DV-0001-${String(3000 + i).padStart(8, "0")}`,
    idCliente: ventas.value[i].idCliente,
    fecha: ventas.value[i].fecha,
    estado: "Activa",
    total: cantidad * precioUnitario,
    detalles: [{ idProducto, cantidad, precioUnitario, subtotal: cantidad * precioUnitario }]
  };
}));

const devolucionesFiltradas = ref([...devoluciones.value]);
const openModal = ref(false);
const openDetalleModal = ref(false);
const devolucionDetalle = ref<{ id: number; idVenta: number; numeroComprobante: string; idCliente: number; fecha: string; estado: string; total: number; detalles: Array<{ idProducto: number; cantidad: number; precioUnitario: number; subtotal: number }> } | null>(null);
const ventaOpen = ref(false);
const ventaSearch = ref("");
const clienteSearch = ref("");
const ventaBox = ref<HTMLElement | null>(null);

const form = ref({ idVenta: 0, numeroComprobante: "", idCliente: 0, observaciones: "" });
const detallesVentaActual = ref<Array<{ idVentaDetalle: number; idProducto: number; productoNombre: string; cantidadVendida: number; precioUnitario: number; cantidadDevolver: number }>>([]);

const totalPaginas = computed(() => Math.max(1, Math.ceil(devolucionesFiltradas.value.length / pageSize)));
const devolucionesPaginadas = computed(() => devolucionesFiltradas.value.slice((page.value - 1) * pageSize, page.value * pageSize));
const ventasFiltradasBusqueda = computed(() => ventas.value.filter(v => ventaSearchLabel(v).toLowerCase().includes(ventaSearch.value.toLowerCase())).slice(0, 8));
const detallesCalculados = computed(() => detallesVentaActual.value.filter(d => (d.cantidadDevolver || 0) > 0));
const totalCalculado = computed(() => detallesCalculados.value.reduce((acc, d) => acc + d.cantidadDevolver * d.precioUnitario, 0));

const clienteLabel = (c: { nombre: string; apellido: string; documento: string }) => `${c.nombre} ${c.apellido} (${c.documento})`;
const nombreCliente = (idCliente: number) => {
  const c = clientes.value.find(x => x.id === idCliente);
  return c ? clienteLabel(c) : `Cliente #${idCliente}`;
};
const formatDate = (value: string) => (value ? new Date(value).toLocaleDateString("es-AR") : "-");
const money = (value: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 }).format(value || 0);
const nombreProducto = (idProducto: number) => productos.value.find(p => p.id === idProducto)?.nombre || `Producto #${idProducto}`;
const ventaLabel = (idVenta: number) => ventas.value.find(v => v.id === idVenta)?.numeroComprobante || `#${idVenta}`;
const ventaSearchLabel = (v: { id: number; numeroComprobante: string; fecha: string; idCliente: number }) => `${v.numeroComprobante} - ${nombreCliente(v.idCliente)} - ${formatDate(v.fecha)}`;

const buscarDevoluciones = () => {
  const d = new Date(`${desde.value}T00:00:00`);
  const h = new Date(`${hasta.value}T23:59:59`);
  if (d > h) return notification.show("La fecha 'desde' no puede ser mayor que 'hasta'", "error");
  devolucionesFiltradas.value = devoluciones.value.filter(v => new Date(v.fecha) >= d && new Date(v.fecha) <= h);
  page.value = 1;
};

const abrirCrear = () => {
  form.value = { idVenta: 0, numeroComprobante: "", idCliente: 0, observaciones: "" };
  ventaSearch.value = "";
  clienteSearch.value = "";
  detallesVentaActual.value = [];
  openModal.value = true;
};
const cerrarModal = () => (openModal.value = false);

const seleccionarVenta = (v: { id: number; numeroComprobante: string; fecha: string; idCliente: number }) => {
  form.value.idVenta = v.id;
  form.value.idCliente = v.idCliente;
  ventaSearch.value = ventaSearchLabel(v);
  clienteSearch.value = nombreCliente(v.idCliente);
  detallesVentaActual.value = productos.value.map((p, i) => ({
    idVentaDetalle: v.id * 10 + i + 1,
    idProducto: p.id,
    productoNombre: p.nombre,
    cantidadVendida: 1 + ((v.id + i) % 4),
    precioUnitario: p.precioUnitario,
    cantidadDevolver: 0
  }));
  ventaOpen.value = false;
};

const limpiarVenta = () => {
  form.value.idVenta = 0;
  form.value.idCliente = 0;
  ventaSearch.value = "";
  clienteSearch.value = "";
  detallesVentaActual.value = [];
};

const guardarDevolucion = () => {
  if (!form.value.idVenta) return notification.show("Seleccioná una venta", "error");
  if (!form.value.numeroComprobante.trim()) return notification.show("Comprobante obligatorio", "error");
  if (!detallesCalculados.value.length) return notification.show("Indicá al menos una cantidad a devolver", "error");
  devoluciones.value.unshift({
    id: Math.max(...devoluciones.value.map(v => v.id), 0) + 1,
    idVenta: form.value.idVenta,
    numeroComprobante: form.value.numeroComprobante,
    idCliente: form.value.idCliente,
    fecha: new Date().toISOString(),
    estado: "Activa",
    total: totalCalculado.value,
    detalles: detallesCalculados.value.map(d => ({
      idProducto: d.idProducto,
      cantidad: d.cantidadDevolver,
      precioUnitario: d.precioUnitario,
      subtotal: d.cantidadDevolver * d.precioUnitario
    }))
  });
  buscarDevoluciones();
  openModal.value = false;
  notification.show("Devolución registrada correctamente (mock)", "success");
};

const verDetalle = (id: number) => {
  const d = devoluciones.value.find(x => x.id === id);
  if (!d) return;
  devolucionDetalle.value = {
    ...d,
    detalles: d.detalles || []
  };
  openDetalleModal.value = true;
};

const cerrarDetalleModal = () => {
  openDetalleModal.value = false;
  devolucionDetalle.value = null;
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  if (ventaBox.value && !ventaBox.value.contains(target)) ventaOpen.value = false;
};

onMounted(() => document.addEventListener("click", handleClickOutside));
onBeforeUnmount(() => document.removeEventListener("click", handleClickOutside));
buscarDevoluciones();
</script>
