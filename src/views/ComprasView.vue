<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Compras</h1>

    <div class="bg-white rounded-xl shadow p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
      <div>
        <label class="text-sm text-gray-600">Desde</label>
        <input
          v-model="desde"
          type="date"
          :max="hasta || undefined"
          class="w-full border px-3 py-2 rounded-md"
          @blur="buscarCompras"
        />
      </div>
      <div>
        <label class="text-sm text-gray-600">Hasta</label>
        <input
          v-model="hasta"
          type="date"
          :min="desde || undefined"
          class="w-full border px-3 py-2 rounded-md"
          @blur="buscarCompras"
        />
      </div>
      <div class="flex items-end">
        <button @click="abrirModalPagoProveedor" class="w-full bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">
          Pagar proveedor
        </button>
      </div>
    </div>

    <div class="flex justify-end mb-4">
      <button @click="abrirCrear" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        + Nueva compra
      </button>
    </div>

    <table class="w-full bg-white rounded shadow">
      <thead>
        <tr class="text-left border-b">
          <th class="p-2">Fecha</th>
          <th class="p-2">Comprobante</th>
          <th class="p-2">Proveedor</th>
          <th class="p-2 text-right">Total</th>
          <th class="p-2 text-right">Pagado</th>
          <th class="p-2 text-right">Saldo</th>
          <th class="p-2">Estado</th>
          <th class="p-2 text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in comprasPaginadas" :key="c.id" class="border-b hover:bg-gray-50">
          <td class="p-2">{{ formatDate(c.fecha) }}</td>
          <td class="p-2">{{ c.numeroComprobante }}</td>
          <td class="p-2">{{ nombreProveedor(c.idProveedor) }}</td>
          <td class="p-2 text-right">{{ money(c.total) }}</td>
          <td class="p-2 text-right">{{ money(c.totalPagado) }}</td>
          <td class="p-2 text-right">{{ money(c.saldoPendiente) }}</td>
          <td class="p-2">
            <span :class="c.estado === 2 ? 'text-red-600' : 'text-green-600'">
              {{ c.estado === 2 ? "Anulada" : "Activa" }}
            </span>
          </td>
          <td class="p-2 text-right">
            <button @click="verDetalle(c.id)" class="text-blue-500 mr-2">Ver</button>
            <button v-if="c.estado !== 2" @click="anular(c.id)" class="text-red-500">Anular</button>
          </td>
        </tr>
        <tr v-if="comprasFiltradas.length === 0">
          <td colspan="8" class="text-center py-4 text-gray-400">No hay compras</td>
        </tr>
      </tbody>
    </table>

    <div class="flex justify-center items-center gap-2 mt-4">
      <button @click="page--" :disabled="page === 1" class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">←</button>
      <span class="text-sm">Página {{ page }} de {{ totalPaginas }}</span>
      <button @click="page++" :disabled="page === totalPaginas" class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">→</button>
    </div>

    <div v-if="openModal" @click.self="cerrarModal" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-xl w-full max-w-6xl shadow-xl max-h-[90vh] flex flex-col">
        <div class="px-6 py-4 border-b bg-gray-50 rounded-t-xl">
          <h2 class="text-lg font-bold text-gray-800">Nueva compra</h2>
        </div>

        <div class="p-6 overflow-y-auto space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="text-sm text-gray-700">Nro. comprobante *</label>
              <input v-model="form.numeroComprobante" class="w-full border px-3 py-2 rounded-md" />
            </div>
            <div>
              <label class="text-sm text-gray-700">Proveedor *</label>
              <select v-model.number="form.idProveedor" class="w-full border px-3 py-2 rounded-md">
                <option :value="0">Seleccionar</option>
                <option v-for="p in proveedores" :key="p.id" :value="p.id">{{ p.razonSocial }}</option>
              </select>
            </div>
          </div>

          <div>
            <label class="text-sm text-gray-700">Observaciones</label>
            <textarea v-model="form.observaciones" rows="2" class="w-full border px-3 py-2 rounded-md"></textarea>
          </div>

          <div class="border rounded-lg p-4 bg-gray-50/50">
            <div class="flex justify-between items-center mb-2">
              <div>
                <h3 class="font-semibold text-gray-800">Detalle de productos</h3>
                <p class="text-xs text-gray-500">Carga un producto y presiona "Agregar". Abajo se muestra el listado.</p>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
              <select v-model.number="nuevoDetalle.idProducto" class="border px-3 py-2 rounded-md w-full md:col-span-2">
                <option :value="0">Seleccionar producto</option>
                <option v-for="prod in productos" :key="prod.id" :value="prod.id">
                  {{ prod.nombre }}
                </option>
              </select>
              <input
                v-model.number="nuevoDetalle.cantidad"
                type="number"
                min="1"
                step="1"
                placeholder="Cantidad"
                class="border px-3 py-2 rounded-md w-full"
                @keydown="bloquearDecimal"
              />
              <input
                v-model.number="nuevoDetalle.precioUnitario"
                type="number"
                min="1"
                step="1"
                placeholder="Precio unitario (entero)"
                class="border px-3 py-2 rounded-md w-full"
                @keydown="bloquearDecimal"
              />
              <button @click="agregarDetalle" class="bg-blue-600 text-white rounded-md px-3 py-2 hover:bg-blue-700">
                Agregar
              </button>
            </div>
            <div class="overflow-x-auto border rounded-md bg-white">
              <table class="w-full min-w-[640px]">
                <thead class="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  <tr>
                    <th class="px-3 py-2">Producto</th>
                    <th class="px-3 py-2 text-right">Cantidad</th>
                    <th class="px-3 py-2 text-right">Precio unitario</th>
                    <th class="px-3 py-2 text-right">Subtotal</th>
                    <th class="px-3 py-2 text-right">Accion</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(d, idx) in form.detalles" :key="idx" class="border-t">
                    <td class="px-3 py-2">{{ nombreProducto(d.idProducto) }}</td>
                    <td class="px-3 py-2 text-right">
                      <input
                        v-model.number="d.cantidad"
                        type="number"
                        min="1"
                        step="1"
                        class="w-24 border rounded px-2 py-1 text-right"
                        @keydown="bloquearDecimal"
                        @blur="normalizarDetalle(idx)"
                      />
                    </td>
                    <td class="px-3 py-2 text-right">
                      <input
                        v-model.number="d.precioUnitario"
                        type="number"
                        min="1"
                        step="1"
                        class="w-32 border rounded px-2 py-1 text-right"
                        @keydown="bloquearDecimal"
                        @blur="normalizarDetalle(idx)"
                      />
                    </td>
                    <td class="px-3 py-2 text-right font-medium">{{ money(d.cantidad * d.precioUnitario) }}</td>
                    <td class="px-3 py-2 text-right">
                      <button @click="quitarDetalle(idx)" class="text-red-600 hover:text-red-700">Quitar</button>
                    </td>
                  </tr>
                  <tr v-if="!form.detalles.length" class="border-t">
                    <td colspan="5" class="px-3 py-4 text-center text-sm text-gray-400">Todavia no agregaste productos.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="border rounded-lg p-3">
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-semibold">Pagos iniciales (opcional)</h3>
              <button @click="agregarPago" class="text-blue-600 text-sm">+ Agregar pago</button>
            </div>
            <div class="space-y-2">
              <div v-for="(p, idx) in form.pagos" :key="idx" class="grid grid-cols-1 md:grid-cols-4 gap-2">
                <select v-model.number="p.idFormaPago" class="border px-3 py-2 rounded-md">
                  <option :value="0">Forma de pago</option>
                  <option v-for="f in formasDePago" :key="f.id" :value="f.id">{{ f.nombre }}</option>
                </select>
                <input v-model.number="p.importe" type="number" min="0.01" step="0.01" placeholder="Importe" class="border px-3 py-2 rounded-md" />
                <input v-model="p.referencia" maxlength="120" placeholder="Referencia" class="border px-3 py-2 rounded-md" />
                <button @click="quitarPago(idx)" class="bg-red-100 text-red-600 rounded-md px-3 py-2">Quitar</button>
              </div>
            </div>
          </div>

          <div class="text-right font-semibold">
            Total calculado: {{ money(totalCalculado) }}
          </div>
        </div>

        <div class="px-6 py-4 border-t bg-gray-50 rounded-b-xl flex justify-end gap-2">
          <button @click="cerrarModal" class="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">Cancelar</button>
          <button @click="guardarCompra" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Guardar</button>
        </div>
      </div>
    </div>

    <div v-if="openDetalleModal && compraDetalle" @click.self="openDetalleModal = false" class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6">
        <h2 class="text-lg font-bold mb-4">Detalle compra #{{ compraDetalle.id }}</h2>
        <div class="grid grid-cols-2 gap-3 text-sm mb-4">
          <p><b>Comprobante:</b> {{ compraDetalle.numeroComprobante }}</p>
          <p><b>Fecha:</b> {{ formatDate(compraDetalle.fecha) }}</p>
          <p><b>Proveedor:</b> {{ nombreProveedor(compraDetalle.idProveedor) }}</p>
          <p><b>Estado:</b> {{ compraDetalle.estado === 2 ? "Anulada" : "Activa" }}</p>
          <p><b>Total:</b> {{ money(compraDetalle.total) }}</p>
          <p><b>Saldo pendiente:</b> {{ money(compraDetalle.saldoPendiente) }}</p>
        </div>
        <h3 class="font-semibold mb-1">Detalles</h3>
        <ul class="mb-3">
          <li v-for="d in compraDetalle.detalles" :key="d.id" class="text-sm border-b py-1">
            {{ nombreProducto(d.idProducto) }} - Cantidad: {{ d.cantidad }} - PU: {{ money(d.precioUnitario) }} - Subtotal: {{ money(d.subtotal) }}
          </li>
        </ul>
        <h3 class="font-semibold mb-1">Pagos</h3>
        <ul>
          <li v-for="p in compraDetalle.pagos" :key="p.id" class="text-sm border-b py-1">
            {{ nombreFormaPago(p.idFormaPago) }} - {{ money(p.importe) }} - {{ p.referencia || "-" }}
          </li>
          <li v-if="compraDetalle.pagos.length === 0" class="text-sm text-gray-400">Sin pagos registrados</li>
        </ul>
      </div>
    </div>

    <div v-if="openPagarProveedorModal" @click.self="cerrarModalPagoProveedor" class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 class="text-lg font-bold mb-4">Pagar proveedor</h2>
        <div class="space-y-3">
          <div>
            <label class="text-sm text-gray-700">Proveedor *</label>
            <select v-model.number="pagoProveedor.idProveedor" class="w-full border px-3 py-2 rounded-md">
              <option :value="0">Seleccionar</option>
              <option v-for="p in proveedores" :key="p.id" :value="p.id">{{ p.razonSocial }}</option>
            </select>
          </div>
          <div>
            <label class="text-sm text-gray-700">Forma de pago *</label>
            <select v-model.number="pagoProveedor.idFormaPago" class="w-full border px-3 py-2 rounded-md">
              <option :value="0">Seleccionar</option>
              <option v-for="f in formasDePago" :key="f.id" :value="f.id">{{ f.nombre }}</option>
            </select>
          </div>
          <div>
            <label class="text-sm text-gray-700">Importe *</label>
            <input v-model.number="pagoProveedor.importe" type="number" min="0.01" step="0.01" class="w-full border px-3 py-2 rounded-md" />
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-5">
          <button @click="cerrarModalPagoProveedor" class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancelar</button>
          <button @click="guardarPagoProveedor" class="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700">Registrar pago</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useNotificationStore } from "@/stores/notificaciones";

interface ProveedorMock {
  id: number;
  razonSocial: string;
}

interface ProductoMock {
  id: number;
  nombre: string;
}

interface FormaPagoMock {
  id: number;
  nombre: string;
}

interface DetalleCompraMock {
  id: number;
  idProducto: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface PagoCompraMock {
  id: number;
  idFormaPago: number;
  importe: number;
  referencia?: string;
}

interface CompraMock {
  id: number;
  numeroComprobante: string;
  fecha: string;
  idProveedor: number;
  idSucursal: number;
  observaciones?: string;
  total: number;
  totalPagado: number;
  saldoPendiente: number;
  estado: number;
  detalles: DetalleCompraMock[];
  pagos: PagoCompraMock[];
}

const notification = useNotificationStore();

const hoy = new Date();
const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
const toInputDate = (d: Date) => d.toISOString().slice(0, 10);

const desde = ref(toInputDate(primerDiaMes));
const hasta = ref(toInputDate(hoy));
const page = ref(1);
const pageSize = 10;

const proveedores = ref<ProveedorMock[]>([
  { id: 1, razonSocial: "Distribuidora Norte SRL" },
  { id: 2, razonSocial: "Alimentos Central SA" },
  { id: 3, razonSocial: "Mayorista del Sur" },
]);

const formasDePago = ref<FormaPagoMock[]>([
  { id: 1, nombre: "Efectivo" },
  { id: 2, nombre: "Transferencia" },
  { id: 3, nombre: "Tarjeta Débito" },
]);

const productos = ref<ProductoMock[]>([
  { id: 101, nombre: "Yerba Mate 1kg" },
  { id: 103, nombre: "Azucar 1kg" },
  { id: 111, nombre: "Aceite Girasol 900ml" },
  { id: 120, nombre: "Arroz Largo Fino 1kg" },
  { id: 125, nombre: "Fideos Spaghetti 500g" },
]);

const compras = ref<CompraMock[]>([
  {
    id: 1,
    numeroComprobante: "A-0001-00001234",
    fecha: new Date(hoy.getFullYear(), hoy.getMonth(), 2).toISOString(),
    idProveedor: 1,
    idSucursal: 1,
    observaciones: "Entrega completa",
    total: 85000,
    totalPagado: 30000,
    saldoPendiente: 55000,
    estado: 1,
    detalles: [
      { id: 1, idProducto: 101, cantidad: 10, precioUnitario: 2500, subtotal: 25000 },
      { id: 2, idProducto: 103, cantidad: 20, precioUnitario: 3000, subtotal: 60000 },
    ],
    pagos: [{ id: 1, idFormaPago: 2, importe: 30000, referencia: "TRX-001" }],
  },
  {
    id: 2,
    numeroComprobante: "A-0001-00001235",
    fecha: new Date(hoy.getFullYear(), hoy.getMonth(), 5).toISOString(),
    idProveedor: 2,
    idSucursal: 1,
    total: 42000,
    totalPagado: 42000,
    saldoPendiente: 0,
    estado: 1,
    detalles: [{ id: 3, idProducto: 111, cantidad: 14, precioUnitario: 3000, subtotal: 42000 }],
    pagos: [{ id: 2, idFormaPago: 1, importe: 42000 }],
  },
]);

const comprasFiltradas = ref<CompraMock[]>([...compras.value]);

const openModal = ref(false);
const openDetalleModal = ref(false);
const openPagarProveedorModal = ref(false);
const compraDetalle = ref<CompraMock | null>(null);

const form = ref({
  numeroComprobante: "",
  idProveedor: 0,
  idSucursal: 1,
  observaciones: "",
  detalles: [] as Array<{ idProducto: number; cantidad: number; precioUnitario: number }>,
  pagos: [] as Array<{ idFormaPago: number; importe: number; referencia?: string }>,
});

const nuevoDetalle = ref({
  idProducto: 0,
  cantidad: 1,
  precioUnitario: 0,
});

const pagoProveedor = ref({
  idProveedor: 0,
  importe: 0,
  idFormaPago: 0,
});

const totalPaginas = computed(() => Math.max(1, Math.ceil(comprasFiltradas.value.length / pageSize)));
const comprasPaginadas = computed(() => {
  const start = (page.value - 1) * pageSize;
  return comprasFiltradas.value.slice(start, start + pageSize);
});
const totalCalculado = computed(() => form.value.detalles.reduce((acc, d) => acc + (Number(d.cantidad) || 0) * (Number(d.precioUnitario) || 0), 0));

const buscarCompras = () => {
  if (!desde.value || !hasta.value) {
    comprasFiltradas.value = [...compras.value];
    page.value = 1;
    return;
  }

  const desdeDate = new Date(`${desde.value}T00:00:00`);
  const hastaDate = new Date(`${hasta.value}T23:59:59`);
  const desdeInvalida = Number.isNaN(desdeDate.getTime());
  const hastaInvalida = Number.isNaN(hastaDate.getTime());

  if (desdeInvalida || hastaInvalida) {
    notification.show("Las fechas ingresadas no son válidas", "error");
    return;
  }

  if (desdeDate > hastaDate) {
    notification.show("La fecha 'desde' no puede ser mayor que 'hasta'", "error");
    return;
  }

  comprasFiltradas.value = compras.value.filter(c => {
    const fecha = new Date(c.fecha);
    return fecha >= desdeDate && fecha <= hastaDate;
  });
  page.value = 1;
};

const abrirCrear = () => {
  form.value = {
    numeroComprobante: "",
    idProveedor: 0,
    idSucursal: 1,
    observaciones: "",
    detalles: [],
    pagos: [],
  };
  nuevoDetalle.value = { idProducto: 0, cantidad: 1, precioUnitario: 0 };
  openModal.value = true;
};

const cerrarModal = () => {
  openModal.value = false;
};

const agregarDetalle = () => {
  const { idProducto, cantidad, precioUnitario } = nuevoDetalle.value;
  if (idProducto <= 0) return notification.show("Selecciona un producto", "error");
  if (cantidad <= 0 || !Number.isInteger(cantidad)) return notification.show("La cantidad debe ser un numero entero mayor a 0", "error");
  if (precioUnitario <= 0 || !Number.isInteger(precioUnitario)) return notification.show("El precio unitario debe ser un numero entero mayor a 0", "error");
  if (form.value.detalles.some(d => d.idProducto === idProducto)) return notification.show("Ese producto ya esta agregado en la tabla", "error");

  form.value.detalles.push({ idProducto, cantidad, precioUnitario });
  nuevoDetalle.value = { idProducto: 0, cantidad: 1, precioUnitario: 0 };
};
const quitarDetalle = (idx: number) => form.value.detalles.splice(idx, 1);
const normalizarDetalle = (idx: number) => {
  const item = form.value.detalles[idx];
  if (!item) return;

  if (!Number.isInteger(item.cantidad) || item.cantidad <= 0) {
    item.cantidad = 1;
    notification.show("La cantidad debe ser un numero entero mayor a 0", "error");
  }

  if (!Number.isFinite(item.precioUnitario) || item.precioUnitario <= 0 || !Number.isInteger(item.precioUnitario)) {
    item.precioUnitario = Math.max(1, Math.round(item.precioUnitario || 0));
    notification.show("El precio unitario debe ser un numero entero mayor a 0", "error");
  }
};
const agregarPago = () => form.value.pagos.push({ idFormaPago: 0, importe: 0, referencia: "" });
const quitarPago = (idx: number) => form.value.pagos.splice(idx, 1);

const bloquearDecimal = (event: KeyboardEvent) => {
  if (event.key === "." || event.key === ",") {
    event.preventDefault();
  }
};

const guardarCompra = () => {
  if (!form.value.numeroComprobante.trim()) return notification.show("El número de comprobante es obligatorio", "error");
  if (form.value.idProveedor <= 0) return notification.show("Debe seleccionar un proveedor", "error");
  if (form.value.idSucursal <= 0) return notification.show("La sucursal es obligatoria", "error");
  if (!form.value.detalles.length) return notification.show("Debe agregar al menos un detalle", "error");

  for (const d of form.value.detalles) {
    if (d.idProducto <= 0 || d.cantidad <= 0 || d.precioUnitario <= 0) {
      return notification.show("Revisá los detalles: producto, cantidad y precio deben ser mayores a 0", "error");
    }
    if (!Number.isInteger(d.cantidad)) {
      return notification.show("La cantidad debe ser un número entero", "error");
    }
  }

  const detalles = form.value.detalles.map((d, i) => ({
    id: i + 1,
    idProducto: d.idProducto,
    cantidad: d.cantidad,
    precioUnitario: d.precioUnitario,
    subtotal: d.cantidad * d.precioUnitario,
  }));

  const pagos = form.value.pagos
    .filter(p => p.idFormaPago > 0 && p.importe > 0)
    .map((p, i) => ({
      id: i + 1,
      idFormaPago: p.idFormaPago,
      importe: p.importe,
      referencia: p.referencia,
    }));

  const total = detalles.reduce((acc, d) => acc + d.subtotal, 0);
  const totalPagado = pagos.reduce((acc, p) => acc + p.importe, 0);
  if (totalPagado > total) {
    return notification.show("Los pagos no pueden superar el total de la compra", "error");
  }

  const nuevaCompra: CompraMock = {
    id: Math.max(0, ...compras.value.map(c => c.id)) + 1,
    numeroComprobante: form.value.numeroComprobante,
    fecha: new Date().toISOString(),
    idProveedor: form.value.idProveedor,
    idSucursal: form.value.idSucursal,
    observaciones: form.value.observaciones || undefined,
    total,
    totalPagado,
    saldoPendiente: Math.max(0, total - totalPagado),
    estado: 1,
    detalles,
    pagos,
  };

  compras.value.unshift(nuevaCompra);
  buscarCompras();
  openModal.value = false;
  notification.show("Compra creada correctamente (mock)", "success");
};

const verDetalle = (id: number) => {
  compraDetalle.value = compras.value.find(c => c.id === id) || null;
  if (!compraDetalle.value) return;
  openDetalleModal.value = true;
};

const anular = (id: number) => {
  const compra = compras.value.find(c => c.id === id);
  if (!compra) return;
  compra.estado = 2;
  notification.show("Compra anulada correctamente (mock)", "success");
  buscarCompras();
};

const abrirModalPagoProveedor = () => {
  pagoProveedor.value = { idProveedor: 0, idFormaPago: 0, importe: 0 };
  openPagarProveedorModal.value = true;
};

const cerrarModalPagoProveedor = () => {
  openPagarProveedorModal.value = false;
};

const guardarPagoProveedor = () => {
  const { idProveedor, idFormaPago, importe } = pagoProveedor.value;
  if (idProveedor <= 0) return notification.show("Debe seleccionar un proveedor", "error");
  if (idFormaPago <= 0) return notification.show("Debe seleccionar una forma de pago", "error");
  if (importe <= 0) return notification.show("El importe debe ser mayor a 0", "error");

  let restante = importe;
  const pendientes = compras.value
    .filter(c => c.idProveedor === idProveedor && c.estado === 1 && c.saldoPendiente > 0)
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  if (!pendientes.length) return notification.show("El proveedor no tiene compras pendientes", "error");

  for (const compra of pendientes) {
    if (restante <= 0) break;
    const monto = Math.min(compra.saldoPendiente, restante);
    compra.pagos.push({
      id: compra.pagos.length + 1,
      idFormaPago,
      importe: monto,
      referencia: "Pago proveedor (mock)",
    });
    compra.totalPagado += monto;
    compra.saldoPendiente -= monto;
    restante -= monto;
  }

  openPagarProveedorModal.value = false;
  buscarCompras();
  notification.show("Pago registrado correctamente (mock)", "success");
};

const nombreProveedor = (idProveedor: number) => {
  const p = proveedores.value.find(x => x.id === idProveedor);
  return p?.razonSocial || `Proveedor #${idProveedor}`;
};

const nombreFormaPago = (idFormaPago: number) => {
  const f = formasDePago.value.find(x => x.id === idFormaPago);
  return f?.nombre || `Forma #${idFormaPago}`;
};

const nombreProducto = (idProducto: number) => {
  const p = productos.value.find(x => x.id === idProducto);
  return p?.nombre || `Producto #${idProducto}`;
};

const money = (value: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 }).format(value || 0);

const formatDate = (value: string) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("es-AR");
};

buscarCompras();
</script>





