<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Ventas</h1>

    <div class="bg-white rounded-xl shadow p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
      <div>
        <label class="text-sm text-gray-600">Desde</label>
        <input v-model="desde" type="date" :max="hasta || undefined" class="w-full border px-3 py-2 rounded-md" @blur="buscarVentas" />
      </div>
      <div>
        <label class="text-sm text-gray-600">Hasta</label>
        <input v-model="hasta" type="date" :min="desde || undefined" class="w-full border px-3 py-2 rounded-md" @blur="buscarVentas" />
      </div>
      <div class="flex items-end">
        <button @click="abrirModalCobroCliente" class="w-full bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">Cobrar cliente</button>
      </div>
    </div>

    <div class="flex justify-end mb-4">
      <button @click="abrirCrear" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">+ Nueva venta</button>
    </div>

    <table class="w-full bg-white rounded shadow">
      <thead>
        <tr class="text-left border-b">
          <th class="p-2">Fecha</th>
          <th class="p-2">Comprobante</th>
          <th class="p-2">Cliente</th>
          <th class="p-2 text-right">Total</th>
          <th class="p-2 text-right">Pagado</th>
          <th class="p-2 text-right">Saldo</th>
          <th class="p-2">Estado</th>
          <th class="p-2 text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="v in ventasPaginadas" :key="v.id" class="border-b hover:bg-gray-50">
          <td class="p-2">{{ formatDate(v.fecha) }}</td>
          <td class="p-2">{{ v.numeroComprobante }}</td>
          <td class="p-2">{{ nombreCliente(v.idCliente) }}</td>
          <td class="p-2 text-right">{{ money(v.total) }}</td>
          <td class="p-2 text-right">{{ money(v.totalPagado) }}</td>
          <td class="p-2 text-right">{{ money(v.saldoPendiente) }}</td>
          <td class="p-2"><span :class="v.estado === 2 ? 'text-red-600' : 'text-green-600'">{{ v.estado === 2 ? 'Anulada' : 'Activa' }}</span></td>
          <td class="p-2 text-right">
            <button @click="verDetalle(v.id)" class="text-blue-500 mr-2">Ver</button>
            <button v-if="v.estado !== 2" @click="anular(v.id)" class="text-red-500">Anular</button>
          </td>
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
        <div class="px-6 py-4 border-b bg-gray-50 rounded-t-xl"><h2 class="text-lg font-bold text-gray-800">Nueva venta</h2></div>
        <div class="p-6 overflow-y-auto space-y-5 flex-1">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="text-sm text-gray-700">Nro. comprobante *</label>
              <input v-model="form.numeroComprobante" class="w-full border px-3 py-2 rounded-md" />
            </div>
            <div ref="clienteBox" class="relative">
              <label class="text-sm text-gray-700">Cliente * (buscar)</label>
              <div class="relative">
                <input v-model="clienteSearch" class="w-full border px-3 py-2 rounded-md pr-8" placeholder="Escribí nombre o documento" @focus="clienteOpen = true" />
                <button v-if="form.idCliente > 0 || clienteSearch" type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-sm" @click="limpiarCliente">×</button>
              </div>
              <div v-if="clienteOpen && clientesFiltrados.length" class="absolute z-20 w-full mt-1 bg-white border rounded-md shadow max-h-44 overflow-y-auto">
                <button v-for="c in clientesFiltrados" :key="c.id" type="button" class="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm" @click="seleccionarCliente(c)">
                  {{ c.nombreCompleto }} - Doc {{ c.documento }}
                </button>
              </div>
            </div>
            <div ref="vendedorBox" class="relative">
              <label class="text-sm text-gray-700">Vendedor *</label>
              <div class="relative">
                <input v-model="vendedorSearch" class="w-full border px-3 py-2 rounded-md pr-8" placeholder="Buscar vendedor" @focus="vendedorOpen = true" />
                <button v-if="form.idVendedor > 0 || vendedorSearch" type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-sm" @click="limpiarVendedor">×</button>
              </div>
              <div v-if="vendedorOpen && vendedoresFiltrados.length" class="absolute z-20 w-full mt-1 bg-white border rounded-md shadow max-h-44 overflow-y-auto">
                <button v-for="v in vendedoresFiltrados" :key="v.id" type="button" class="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm" @click="seleccionarVendedor(v)">
                  {{ v.nombre }}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label class="text-sm text-gray-700">Observaciones</label>
            <textarea v-model="form.observaciones" rows="2" class="w-full border px-3 py-2 rounded-md"></textarea>
          </div>

          <div class="border rounded-lg p-4 bg-gray-50/50">
            <h3 class="font-semibold text-gray-800 mb-2">Detalle de productos</h3>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
              <div ref="productoBox" class="relative md:col-span-2">
                <div class="relative">
                  <input v-model="productoSearch" class="border px-3 py-2 rounded-md w-full pr-8" placeholder="Buscar producto o marca" @focus="abrirBuscadorProducto" />
                  <button v-if="nuevoDetalle.idProducto > 0 || productoSearch" type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-sm" @click="limpiarProducto">×</button>
                </div>
                <div v-if="productoOpen && productosFiltrados.length" :class="['absolute z-20 w-full bg-white border rounded-md shadow max-h-52 overflow-y-auto', productoDropdownArriba ? 'bottom-full mb-1' : 'top-full mt-1']">
                  <button v-for="p in productosFiltrados" :key="p.id" type="button" class="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm" @click="seleccionarProducto(p)">
                    {{ p.nombre }} - {{ p.marcaNombre }}
                  </button>
                </div>
              </div>
              <input v-model.number="nuevoDetalle.cantidad" type="number" min="1" step="1" placeholder="Cantidad" class="border px-3 py-2 rounded-md w-full" />
              <input v-model.number="nuevoDetalle.precioUnitario" type="number" min="1" step="1" placeholder="Precio unitario" class="border px-3 py-2 rounded-md w-full" />
              <button @click="agregarDetalle" class="bg-blue-600 text-white rounded-md px-3 py-2 hover:bg-blue-700">Agregar</button>
            </div>
            <div class="overflow-x-auto border rounded-md bg-white">
              <table class="w-full min-w-[640px]">
                <thead class="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  <tr>
                    <th class="px-3 py-2">Producto</th><th class="px-3 py-2">Marca</th><th class="px-3 py-2 text-right">Cantidad</th><th class="px-3 py-2 text-right">Precio</th><th class="px-3 py-2 text-right">Subtotal</th><th class="px-3 py-2 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(d, idx) in form.detalles" :key="idx" class="border-t">
                    <td class="px-3 py-2">{{ nombreProducto(d.idProducto) }}</td>
                    <td class="px-3 py-2">{{ marcaProducto(d.idProducto) }}</td>
                    <td class="px-3 py-2 text-right">{{ d.cantidad }}</td>
                    <td class="px-3 py-2 text-right">{{ money(d.precioUnitario) }}</td>
                    <td class="px-3 py-2 text-right">{{ money(d.cantidad * d.precioUnitario) }}</td>
                    <td class="px-3 py-2 text-right"><button @click="quitarDetalle(idx)" class="text-red-600">Quitar</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="border rounded-lg p-3">
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-semibold">Pagos iniciales (opcional)</h3>
              <div class="flex items-center gap-3">
                <label class="text-sm flex items-center gap-1">
                  <input type="checkbox" v-model="pagarTodo" @change="togglePagarTodo" />
                  Pagar todo
                </label>
                <button @click="agregarPago" class="text-blue-600 text-sm" :disabled="pagarTodo">+ Agregar pago</button>
              </div>
            </div>
            <div class="space-y-2">
              <div v-for="(p, idx) in form.pagos" :key="idx" class="grid grid-cols-1 md:grid-cols-4 gap-2">
                <select v-model.number="p.idFormaPago" class="border px-3 py-2 rounded-md">
                  <option :value="0">Forma de pago</option>
                  <option v-for="f in formasDePago" :key="f.id" :value="f.id">{{ f.nombre }}</option>
                </select>
                <input
                  v-if="pagarTodo"
                  :value="formatoMiles(p.importe)"
                  type="text"
                  class="border px-3 py-2 rounded-md bg-gray-50"
                  readonly
                />
                <input
                  v-else
                  v-model.number="p.importe"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Importe"
                  class="border px-3 py-2 rounded-md"
                />
                <input v-model="p.referencia" maxlength="120" placeholder="Referencia" class="border px-3 py-2 rounded-md" />
                <button @click="quitarPago(idx)" class="bg-red-100 text-red-600 rounded-md px-3 py-2">Quitar</button>
              </div>
            </div>
          </div>

          <div class="text-right font-semibold">Total calculado: {{ money(totalCalculado) }}</div>
        </div>
        <div class="px-6 py-4 border-t bg-gray-50 rounded-b-xl flex justify-end gap-2">
          <button @click="cerrarModal" class="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">Cancelar</button>
          <button @click="guardarVenta" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Guardar</button>
        </div>
      </div>
    </div>

    <div v-if="openCobroClienteModal" class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 class="text-lg font-bold mb-4">Cobrar cliente</h2>
        <div class="space-y-3">
          <div ref="cobroClienteBox" class="relative">
            <label class="text-sm text-gray-700">Cliente * (buscar)</label>
            <div class="relative">
              <input v-model="cobroClienteSearch" class="w-full border px-3 py-2 rounded-md pr-8" @focus="cobroClienteOpen = true" />
              <button v-if="cobroCliente.idCliente > 0 || cobroClienteSearch" type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-sm" @click="limpiarClienteCobro">×</button>
            </div>
            <div v-if="cobroClienteOpen && clientesFiltradosCobro.length" class="absolute z-20 w-full mt-1 bg-white border rounded-md shadow max-h-44 overflow-y-auto">
              <button v-for="c in clientesFiltradosCobro" :key="c.id" type="button" class="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm" @click="seleccionarClienteCobro(c)">
                {{ c.nombreCompleto }} - Doc {{ c.documento }}
              </button>
            </div>
          </div>
          <div><label class="text-sm text-gray-700">Forma de pago *</label>
            <select v-model.number="cobroCliente.idFormaPago" class="w-full border px-3 py-2 rounded-md"><option :value="0">Seleccionar</option><option v-for="f in formasDePago" :key="f.id" :value="f.id">{{ f.nombre }}</option></select>
          </div>
          <div><label class="text-sm text-gray-700">Importe *</label><input v-model.number="cobroCliente.importe" type="number" min="1" step="1" class="w-full border px-3 py-2 rounded-md" /></div>
        </div>
        <div class="flex justify-end gap-2 mt-5"><button @click="cerrarModalCobroCliente" class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancelar</button><button @click="guardarCobroCliente" class="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700">Registrar cobro</button></div>
      </div>
    </div>

    <div v-if="openDetalleModal && ventaDetalle" class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold mb-4">Detalle venta #{{ ventaDetalle.id }}</h2>
        <div class="grid grid-cols-2 gap-3 text-sm mb-4">
          <p><b>Comprobante:</b> {{ ventaDetalle.numeroComprobante }}</p>
          <p><b>Fecha:</b> {{ formatDate(ventaDetalle.fecha) }}</p>
          <p><b>Cliente:</b> {{ nombreCliente(ventaDetalle.idCliente) }}</p>
          <p><b>Estado:</b> {{ ventaDetalle.estado === 2 ? "Anulada" : "Activa" }}</p>
          <p><b>Total:</b> {{ money(ventaDetalle.total) }}</p>
          <p><b>Saldo pendiente:</b> {{ money(ventaDetalle.saldoPendiente) }}</p>
        </div>

        <h3 class="font-semibold mb-1">Productos</h3>
        <ul class="mb-4">
          <li v-for="d in ventaDetalle.detalles || []" :key="d.id" class="text-sm border-b py-2">
            {{ nombreProducto(d.idProducto) }} - {{ marcaProducto(d.idProducto) }} - Cantidad: {{ d.cantidad }} - PU: {{ money(d.precioUnitario) }} - Subtotal: {{ money((d.subtotal || (d.cantidad * d.precioUnitario))) }}
          </li>
          <li v-if="!(ventaDetalle.detalles || []).length" class="text-sm text-gray-400">Sin productos</li>
        </ul>

        <h3 class="font-semibold mb-1">Pagos</h3>
        <ul class="mb-5">
          <li v-for="p in ventaDetalle.pagos || []" :key="p.id" class="text-sm border-b py-2">
            {{ nombreFormaPago(p.idFormaPago) }} - {{ money(p.importe) }} - {{ p.referencia || "-" }}
          </li>
          <li v-if="!(ventaDetalle.pagos || []).length" class="text-sm text-gray-400">Sin pagos</li>
        </ul>

        <div class="flex justify-end">
          <button @click="cerrarDetalleModal" class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cerrar</button>
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

const clientes = ref(Array.from({ length: 25 }, (_, i) => ({ id: i + 1, nombreCompleto: `Cliente ${i + 1} Perez`, documento: `30${10000000 + i}` })));
const vendedores = ref([{ id: 1, nombre: "Juan Soto" }, { id: 2, nombre: "Ana Diaz" }, { id: 3, nombre: "Martin Ruiz" }]);
const productos = ref([
  { id: 100, nombre: "Yerba Mate 1kg", marcaNombre: "La Merced" },
  { id: 101, nombre: "Azucar 1kg", marcaNombre: "Ledesma" },
  { id: 102, nombre: "Arroz Largo Fino 1kg", marcaNombre: "Gallo" },
  { id: 103, nombre: "Fideos Spaghetti 500g", marcaNombre: "Matarazzo" },
  { id: 104, nombre: "Aceite Girasol 900ml", marcaNombre: "Natura" },
  { id: 105, nombre: "Leche Entera 1L", marcaNombre: "La Serenisima" },
  { id: 106, nombre: "Galletitas Dulces 400g", marcaNombre: "Terrabusi" },
  { id: 107, nombre: "Atun en Lata 170g", marcaNombre: "La Campagnola" },
  { id: 108, nombre: "Pure de Tomate 520g", marcaNombre: "Arcor" },
  { id: 109, nombre: "Jabon en Polvo 800g", marcaNombre: "Ala" },
  { id: 110, nombre: "Cafe Molido 500g", marcaNombre: "Cabrales" },
  { id: 111, nombre: "Te en Saquitos x50", marcaNombre: "Taragui" },
  { id: 112, nombre: "Harina 000 1kg", marcaNombre: "Pureza" },
  { id: 113, nombre: "Polenta 500g", marcaNombre: "Presto Pronta" },
  { id: 114, nombre: "Lentejas 400g", marcaNombre: "Lucchetti" },
  { id: 115, nombre: "Porotos Alubia 400g", marcaNombre: "Noel" },
  { id: 116, nombre: "Mayonesa 500g", marcaNombre: "Hellmanns" },
  { id: 117, nombre: "Ketchup 500g", marcaNombre: "Heinz" },
  { id: 118, nombre: "Mostaza 250g", marcaNombre: "Savora" },
  { id: 119, nombre: "Vinagre de Alcohol 1L", marcaNombre: "Menoyo" },
  { id: 120, nombre: "Agua Mineral 2L", marcaNombre: "Eco de los Andes" },
  { id: 121, nombre: "Gaseosa Cola 2.25L", marcaNombre: "Coca-Cola" },
  { id: 122, nombre: "Gaseosa Lima 2.25L", marcaNombre: "Sprite" },
  { id: 123, nombre: "Jugo Naranja 1L", marcaNombre: "Cepita" },
  { id: 124, nombre: "Cerveza Rubia 1L", marcaNombre: "Quilmes" },
  { id: 125, nombre: "Papel Higienico x4", marcaNombre: "Elite" },
  { id: 126, nombre: "Servilletas x100", marcaNombre: "Sussex" },
  { id: 127, nombre: "Detergente 750ml", marcaNombre: "Magistral" },
  { id: 128, nombre: "Lavandina 1L", marcaNombre: "Ayudin" },
  { id: 129, nombre: "Desinfectante Piso 900ml", marcaNombre: "Poett" },
  { id: 130, nombre: "Shampoo 400ml", marcaNombre: "Sedal" },
  { id: 131, nombre: "Acondicionador 400ml", marcaNombre: "Pantene" },
  { id: 132, nombre: "Jabon Tocador x3", marcaNombre: "Dove" },
  { id: 133, nombre: "Pasta Dental 90g", marcaNombre: "Colgate" },
  { id: 134, nombre: "Cepillo Dental", marcaNombre: "Oral-B" },
]);
const formasDePago = ref([{ id: 1, nombre: "Efectivo" }, { id: 2, nombre: "Transferencia" }, { id: 3, nombre: "Tarjeta" }]);

const ventas = ref(Array.from({ length: 40 }, (_, i) => {
  const total = 15000 + i * 2300;
  const pagado = i % 4 === 0 ? total : Math.floor(total * 0.45);
  return {
    id: i + 1,
    numeroComprobante: `V-0001-${String(1000 + i).padStart(8, "0")}`,
    fecha: new Date(hoy.getFullYear(), hoy.getMonth(), (i % 28) + 1).toISOString(),
    idCliente: (i % 25) + 1,
    idVendedor: (i % 3) + 1,
    idSucursal: 1,
    total,
    totalPagado: pagado,
    saldoPendiente: total - pagado,
    estado: i % 11 === 0 ? 2 : 1,
    observaciones: "Venta de prueba",
    detalles: [{ id: 1, idProducto: 100 + (i % 10), cantidad: 2 + (i % 3), precioUnitario: 3000 + i * 40 }],
    pagos: pagado > 0 ? [{ id: 1, idFormaPago: 1, importe: pagado, referencia: "Pago mock" }] : []
  };
}));

const ventasFiltradas = ref([...ventas.value]);
const openModal = ref(false);
const openCobroClienteModal = ref(false);
const openDetalleModal = ref(false);
const ventaDetalle = ref<any | null>(null);
const clienteOpen = ref(false);
const productoOpen = ref(false);
const productoDropdownArriba = ref(false);
const cobroClienteOpen = ref(false);
const vendedorOpen = ref(false);
const clienteBox = ref<HTMLElement | null>(null);
const vendedorBox = ref<HTMLElement | null>(null);
const productoBox = ref<HTMLElement | null>(null);
const cobroClienteBox = ref<HTMLElement | null>(null);

const clienteSearch = ref("");
const productoSearch = ref("");
const cobroClienteSearch = ref("");
const vendedorSearch = ref("");

const form = ref({
  numeroComprobante: "",
  idCliente: 0,
  idVendedor: 0,
  idSucursal: 1,
  observaciones: "",
  detalles: [] as Array<{ idProducto: number; cantidad: number; precioUnitario: number }>,
  pagos: [] as Array<{ idFormaPago: number; importe: number; referencia?: string }>,
});
const nuevoDetalle = ref({ idProducto: 0, cantidad: 1, precioUnitario: 0 });
const cobroCliente = ref({ idCliente: 0, importe: 0, idFormaPago: 0, referencia: "" });
const pagarTodo = ref(false);

const totalPaginas = computed(() => Math.max(1, Math.ceil(ventasFiltradas.value.length / pageSize)));
const ventasPaginadas = computed(() => ventasFiltradas.value.slice((page.value - 1) * pageSize, page.value * pageSize));
const totalCalculado = computed(() => form.value.detalles.reduce((acc, d) => acc + d.cantidad * d.precioUnitario, 0));
const clientesFiltrados = computed(() => clientes.value.filter(c => (`${c.nombreCompleto} ${c.documento}`).toLowerCase().includes(clienteSearch.value.toLowerCase())).slice(0, 8));
const clientesFiltradosCobro = computed(() => clientes.value.filter(c => (`${c.nombreCompleto} ${c.documento}`).toLowerCase().includes(cobroClienteSearch.value.toLowerCase())).slice(0, 8));
const productosFiltrados = computed(() => productos.value.filter(p => (`${p.nombre} ${p.marcaNombre}`).toLowerCase().includes(productoSearch.value.toLowerCase())).slice(0, 10));
const vendedoresFiltrados = computed(() => vendedores.value.filter(v => v.nombre.toLowerCase().includes(vendedorSearch.value.toLowerCase())).slice(0, 8));

const abrirBuscadorProducto = () => {
  productoOpen.value = true;
  const espacioAbajo = window.innerHeight - 420;
  productoDropdownArriba.value = espacioAbajo < 260;
};

const buscarVentas = () => {
  const d = new Date(`${desde.value}T00:00:00`);
  const h = new Date(`${hasta.value}T23:59:59`);
  if (d > h) return notification.show("La fecha 'desde' no puede ser mayor que 'hasta'", "error");
  ventasFiltradas.value = ventas.value.filter(v => new Date(v.fecha) >= d && new Date(v.fecha) <= h);
  page.value = 1;
};

const abrirCrear = () => {
  form.value = { numeroComprobante: "", idCliente: 0, idVendedor: 0, idSucursal: 1, observaciones: "", detalles: [], pagos: [] };
  pagarTodo.value = false;
  clienteSearch.value = "";
  productoSearch.value = "";
  vendedorSearch.value = "";
  clienteOpen.value = false;
  productoOpen.value = false;
  vendedorOpen.value = false;
  nuevoDetalle.value = { idProducto: 0, cantidad: 1, precioUnitario: 0 };
  openModal.value = true;
};
const cerrarModal = () => (openModal.value = false);

const seleccionarCliente = (cliente: { id: number; nombreCompleto: string; documento: string }) => {
  form.value.idCliente = cliente.id;
  clienteSearch.value = `${cliente.nombreCompleto} - Doc ${cliente.documento}`;
  clienteOpen.value = false;
};
const limpiarCliente = () => {
  form.value.idCliente = 0;
  clienteSearch.value = "";
};
const seleccionarProducto = (producto: { id: number; nombre: string; marcaNombre: string }) => {
  nuevoDetalle.value.idProducto = producto.id;
  productoSearch.value = `${producto.nombre} - ${producto.marcaNombre}`;
  productoOpen.value = false;
};
const limpiarProducto = () => {
  nuevoDetalle.value.idProducto = 0;
  productoSearch.value = "";
};
const seleccionarClienteCobro = (cliente: { id: number; nombreCompleto: string; documento: string }) => {
  cobroCliente.value.idCliente = cliente.id;
  cobroClienteSearch.value = `${cliente.nombreCompleto} - Doc ${cliente.documento}`;
  cobroClienteOpen.value = false;
};
const limpiarClienteCobro = () => {
  cobroCliente.value.idCliente = 0;
  cobroClienteSearch.value = "";
};
const seleccionarVendedor = (vendedor: { id: number; nombre: string }) => {
  form.value.idVendedor = vendedor.id;
  vendedorSearch.value = vendedor.nombre;
  vendedorOpen.value = false;
};
const limpiarVendedor = () => {
  form.value.idVendedor = 0;
  vendedorSearch.value = "";
};

const agregarDetalle = () => {
  const { idProducto, cantidad, precioUnitario } = nuevoDetalle.value;
  if (!idProducto) return notification.show("Seleccioná un producto", "error");
  if (cantidad <= 0 || precioUnitario <= 0) return notification.show("Cantidad y precio deben ser mayores a 0", "error");
  if (form.value.detalles.some(d => d.idProducto === idProducto)) return notification.show("Producto repetido", "error");
  form.value.detalles.push({ idProducto, cantidad, precioUnitario });
  nuevoDetalle.value = { idProducto: 0, cantidad: 1, precioUnitario: 0 };
  productoSearch.value = "";
};
const quitarDetalle = (idx: number) => form.value.detalles.splice(idx, 1);
const agregarPago = () => form.value.pagos.push({ idFormaPago: 0, importe: 0, referencia: "" });
const quitarPago = (idx: number) => form.value.pagos.splice(idx, 1);
const togglePagarTodo = () => {
  if (pagarTodo.value) {
    form.value.pagos = [{ idFormaPago: 0, importe: totalCalculado.value, referencia: "Pago total" }];
    return;
  }
  form.value.pagos = [];
};

const guardarVenta = () => {
  if (!form.value.numeroComprobante.trim()) return notification.show("Comprobante obligatorio", "error");
  if (!form.value.idCliente) return notification.show("Seleccioná cliente", "error");
  if (!form.value.idVendedor) return notification.show("Seleccioná vendedor", "error");
  if (!form.value.detalles.length) return notification.show("Agregá al menos un producto", "error");
  if (pagarTodo.value && form.value.pagos.length) {
    form.value.pagos[0].importe = totalCalculado.value;
  }
  const total = totalCalculado.value;
  const pagosValidos = form.value.pagos.filter(p => p.idFormaPago > 0 && p.importe > 0);
  const totalPagado = pagosValidos.reduce((acc, p) => acc + p.importe, 0);
  if (totalPagado > total) return notification.show("Los pagos no pueden superar el total", "error");
  ventas.value.unshift({
    id: Math.max(...ventas.value.map(v => v.id), 0) + 1,
    numeroComprobante: form.value.numeroComprobante,
    fecha: new Date().toISOString(),
    idCliente: form.value.idCliente,
    idVendedor: form.value.idVendedor,
    idSucursal: 1,
    total,
    totalPagado,
    saldoPendiente: total - totalPagado,
    estado: 1,
    observaciones: form.value.observaciones,
    detalles: form.value.detalles.map((d, i) => ({ ...d, id: i + 1, subtotal: d.cantidad * d.precioUnitario })),
    pagos: pagosValidos.map((p, i) => ({ id: i + 1, idFormaPago: p.idFormaPago, importe: p.importe, referencia: p.referencia || "Pago inicial mock" }))
  });
  buscarVentas();
  openModal.value = false;
  notification.show("Venta creada correctamente (mock)", "success");
};

const anular = (id: number) => {
  const venta = ventas.value.find(v => v.id === id);
  if (!venta) return;
  venta.estado = 2;
  notification.show("Venta anulada correctamente (mock)", "success");
  buscarVentas();
};

const verDetalle = (id: number) => {
  const venta = ventas.value.find(v => v.id === id);
  if (!venta) return;
  ventaDetalle.value = venta;
  openDetalleModal.value = true;
};
const cerrarDetalleModal = () => {
  openDetalleModal.value = false;
  ventaDetalle.value = null;
};

const abrirModalCobroCliente = () => {
  cobroCliente.value = { idCliente: 0, idFormaPago: 0, importe: 0, referencia: "" };
  cobroClienteSearch.value = "";
  openCobroClienteModal.value = true;
};
const cerrarModalCobroCliente = () => (openCobroClienteModal.value = false);

const guardarCobroCliente = () => {
  const { idCliente, idFormaPago, importe } = cobroCliente.value;
  if (!idCliente || !idFormaPago || importe <= 0) return notification.show("Completá cliente, forma de pago e importe", "error");
  let restante = importe;
  const pendientes = ventas.value.filter(v => v.idCliente === idCliente && v.estado === 1 && v.saldoPendiente > 0).sort((a, b) => +new Date(a.fecha) - +new Date(b.fecha));
  if (!pendientes.length) return notification.show("Ese cliente no tiene saldo pendiente", "error");
  for (const v of pendientes) {
    if (restante <= 0) break;
    const monto = Math.min(v.saldoPendiente, restante);
    v.totalPagado += monto;
    v.saldoPendiente -= monto;
    v.pagos.push({ id: v.pagos.length + 1, idFormaPago, importe: monto, referencia: "Cobro mock" });
    restante -= monto;
  }
  openCobroClienteModal.value = false;
  buscarVentas();
  notification.show("Cobro registrado correctamente (mock)", "success");
};

const nombreCliente = (idCliente: number) => clientes.value.find(c => c.id === idCliente)?.nombreCompleto || `Cliente #${idCliente}`;
const nombreProducto = (idProducto: number) => productos.value.find(p => p.id === idProducto)?.nombre || `Producto #${idProducto}`;
const marcaProducto = (idProducto: number) => productos.value.find(p => p.id === idProducto)?.marcaNombre || "-";
const nombreFormaPago = (idFormaPago: number) => formasDePago.value.find(f => f.id === idFormaPago)?.nombre || `Forma #${idFormaPago}`;
const money = (value: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 }).format(value || 0);
const formatoMiles = (value: number) => new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(value || 0);
const formatDate = (value: string) => (value ? new Date(value).toLocaleDateString("es-AR") : "-");

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  if (clienteBox.value && !clienteBox.value.contains(target)) clienteOpen.value = false;
  if (vendedorBox.value && !vendedorBox.value.contains(target)) vendedorOpen.value = false;
  if (productoBox.value && !productoBox.value.contains(target)) productoOpen.value = false;
  if (cobroClienteBox.value && !cobroClienteBox.value.contains(target)) cobroClienteOpen.value = false;
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

buscarVentas();
</script>

