<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Devoluciones de compras</h1>
    <div class="bg-white rounded-xl shadow p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
      <div><label class="text-sm text-gray-600">Desde</label><input v-model="desde" type="date" :max="hasta || undefined" class="w-full border px-3 py-2 rounded-md" @blur="buscarDevoluciones" /></div>
      <div><label class="text-sm text-gray-600">Hasta</label><input v-model="hasta" type="date" :min="desde || undefined" class="w-full border px-3 py-2 rounded-md" @blur="buscarDevoluciones" /></div>
      <div class="flex items-end"><button @click="buscarDevoluciones" class="w-full bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-800">Actualizar</button></div>
    </div>
    <div class="flex justify-end mb-4"><button @click="abrirCrear" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">+ Nueva devolución</button></div>

    <table class="w-full bg-white rounded shadow">
      <thead><tr class="text-left border-b"><th class="p-2">Fecha</th><th class="p-2">Compra</th><th class="p-2">Proveedor</th><th class="p-2">Motivo</th><th class="p-2 text-right">Total</th><th class="p-2">Estado</th><th class="p-2 text-right">Acciones</th></tr></thead>
      <tbody>
        <tr v-for="d in devolucionesPaginadas" :key="d.id" class="border-b hover:bg-gray-50">
          <td class="p-2">{{ formatDate(d.fecha) }}</td><td class="p-2">{{ compraLabel(d.idCompra) }}</td><td class="p-2">{{ nombreProveedor(d.idProveedor) }}</td><td class="p-2">{{ d.motivo || "-" }}</td><td class="p-2 text-right">{{ money(d.total) }}</td><td class="p-2"><span class="text-green-600">{{ d.estado === 1 ? "Activa" : "Inactiva" }}</span></td>
          <td class="p-2 text-right"><button type="button" @click.stop="verDetalle(d.id)" class="text-blue-500 hover:text-blue-700 cursor-pointer">Ver</button></td>
        </tr>
      </tbody>
    </table>

    <div class="flex justify-center items-center gap-2 mt-4"><button @click="page--" :disabled="page === 1" class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">←</button><span class="text-sm">Página {{ page }} de {{ totalPaginas }}</span><button @click="page++" :disabled="page === totalPaginas" class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">→</button></div>

    <div v-if="openModal" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-xl w-full max-w-6xl shadow-xl max-h-[95vh] h-[95vh] flex flex-col">
        <div class="px-6 py-4 border-b bg-gray-50 rounded-t-xl"><h2 class="text-lg font-bold text-gray-800">Nueva devolución de compra</h2></div>
        <div class="p-6 overflow-y-auto space-y-5 flex-1">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div ref="compraBox" class="relative">
              <label class="text-sm text-gray-700">Compra *</label>
              <div class="relative"><input v-model="compraSearch" class="w-full border px-3 py-2 rounded-md pr-8" placeholder="Buscar por comprobante, proveedor o fecha" @focus="compraOpen = true" /><button v-if="form.idCompra > 0 || compraSearch" type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-sm" @click="limpiarCompra">×</button></div>
              <div v-if="compraOpen && comprasFiltradasBusqueda.length" class="absolute z-20 w-full mt-1 bg-white border rounded-md shadow max-h-44 overflow-y-auto"><button v-for="c in comprasFiltradasBusqueda" :key="c.id" type="button" class="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm" @click="seleccionarCompra(c)">{{ compraSearchLabel(c) }}</button></div>
            </div>
            <div><label class="text-sm text-gray-700">Proveedor *</label><input :value="proveedorSearch" class="w-full border px-3 py-2 rounded-md bg-gray-50" readonly /></div>
          </div>
          <div><label class="text-sm text-gray-700">Motivo</label><textarea v-model="form.motivo" rows="2" class="w-full border px-3 py-2 rounded-md"></textarea></div>

          <div class="border rounded-lg p-4 bg-gray-50/50">
            <h3 class="font-semibold text-gray-800 mb-2">Detalle de la compra seleccionada</h3>
            <div v-if="!form.idCompra" class="text-sm text-gray-500 border rounded-md bg-white px-3 py-3">Seleccioná una compra para cargar cantidades a devolver.</div>
            <div v-else class="overflow-x-auto border rounded-md bg-white">
              <table class="w-full min-w-[760px]">
                <thead class="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide"><tr><th class="px-3 py-2">Producto</th><th class="px-3 py-2 text-right">Cant. comprada</th><th class="px-3 py-2 text-right">Precio unitario</th><th class="px-3 py-2 text-right">Cantidad a devolver</th><th class="px-3 py-2 text-right">Subtotal devolución</th></tr></thead>
                <tbody>
                  <tr v-for="d in detallesCompraActual" :key="d.idProducto" class="border-t">
                    <td class="px-3 py-2">{{ d.productoNombre }}</td><td class="px-3 py-2 text-right">{{ d.cantidadComprada }}</td><td class="px-3 py-2 text-right">{{ money(d.precioUnitario) }}</td><td class="px-3 py-2 text-right"><input v-model.number="d.cantidadDevolver" type="number" min="0" :max="d.cantidadComprada" class="border px-2 py-1 rounded-md w-24 text-right" /></td><td class="px-3 py-2 text-right">{{ money((d.cantidadDevolver || 0) * d.precioUnitario) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="border rounded-lg p-3">
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-semibold">Pagos de devolución (opcional)</h3>
              <div class="flex items-center gap-3">
                <label class="text-sm flex items-center gap-1"><input type="checkbox" v-model="pagarTodo" @change="togglePagarTodo" /> Pagar todo</label>
                <button @click="agregarPago" class="text-blue-600 text-sm" :disabled="pagarTodo">+ Agregar pago</button>
              </div>
            </div>
            <div class="space-y-2">
              <div v-for="(p, idx) in form.pagos" :key="idx" class="grid grid-cols-1 md:grid-cols-4 gap-2">
                <select v-model.number="p.idFormaPago" class="border px-3 py-2 rounded-md"><option :value="0">Forma de pago</option><option v-for="f in formasDePago" :key="f.id" :value="f.id">{{ f.nombre }}</option></select>
                <input v-if="pagarTodo" :value="money(p.importe)" type="text" readonly class="border px-3 py-2 rounded-md bg-gray-50" />
                <input v-else v-model.number="p.importe" type="number" min="1" step="1" placeholder="Importe" class="border px-3 py-2 rounded-md" />
                <input v-model="p.referencia" maxlength="120" placeholder="Referencia" class="border px-3 py-2 rounded-md" />
                <button @click="quitarPago(idx)" class="bg-red-100 text-red-600 rounded-md px-3 py-2">Quitar</button>
              </div>
            </div>
          </div>
          <div class="text-right font-semibold">Total devolución: {{ money(totalCalculado) }}</div>
        </div>
        <div class="px-6 py-4 border-t bg-gray-50 rounded-b-xl flex justify-end gap-2"><button @click="cerrarModal" class="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">Cancelar</button><button @click="guardarDevolucion" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Guardar</button></div>
      </div>
    </div>

    <div v-if="openDetalleModal && devolucionDetalle" class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold mb-4">Detalle devolución compra #{{ devolucionDetalle.id }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm"><p><b>Fecha:</b> {{ formatDate(devolucionDetalle.fecha) }}</p><p><b>Compra:</b> {{ compraLabel(devolucionDetalle.idCompra) }}</p><p><b>Proveedor:</b> {{ nombreProveedor(devolucionDetalle.idProveedor) }}</p><p><b>Motivo:</b> {{ devolucionDetalle.motivo || "-" }}</p><p><b>Estado:</b> {{ devolucionDetalle.estado === 1 ? "Activa" : "Inactiva" }}</p><p><b>Total:</b> {{ money(devolucionDetalle.total) }}</p></div>
        <h3 class="font-semibold mt-5 mb-2">Productos devueltos</h3>
        <div class="overflow-x-auto border rounded-md"><table class="w-full min-w-[640px] bg-white"><thead class="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide"><tr><th class="px-3 py-2">Producto</th><th class="px-3 py-2 text-right">Cantidad</th><th class="px-3 py-2 text-right">Precio unitario</th><th class="px-3 py-2 text-right">Subtotal</th></tr></thead><tbody><tr v-for="(item, idx) in (devolucionDetalle.detalles || [])" :key="idx" class="border-t"><td class="px-3 py-2">{{ nombreProducto(item.idProducto) }}</td><td class="px-3 py-2 text-right">{{ item.cantidad }}</td><td class="px-3 py-2 text-right">{{ money(item.precioUnitario) }}</td><td class="px-3 py-2 text-right">{{ money(item.subtotal) }}</td></tr></tbody><tfoot><tr class="border-t bg-gray-50 font-semibold"><td class="px-3 py-2 text-right" colspan="3">Total</td><td class="px-3 py-2 text-right">{{ money(devolucionDetalle.total) }}</td></tr></tfoot></table></div>
        <h3 class="font-semibold mt-5 mb-2">Pagos</h3>
        <div class="overflow-x-auto border rounded-md"><table class="w-full min-w-[640px] bg-white"><thead class="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide"><tr><th class="px-3 py-2">Forma de pago</th><th class="px-3 py-2 text-right">Importe</th><th class="px-3 py-2">Referencia</th></tr></thead><tbody><tr v-for="(p, idx) in (devolucionDetalle.pagos || [])" :key="idx" class="border-t"><td class="px-3 py-2">{{ nombreFormaPago(p.idFormaPago) }}</td><td class="px-3 py-2 text-right">{{ money(p.importe) }}</td><td class="px-3 py-2">{{ p.referencia || "-" }}</td></tr><tr v-if="!(devolucionDetalle.pagos || []).length" class="border-t"><td colspan="3" class="px-3 py-3 text-sm text-gray-500">Sin pagos registrados.</td></tr></tbody></table></div>
        <div class="flex justify-end mt-5"><button @click="cerrarDetalleModal" class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 cursor-pointer">Cerrar</button></div>
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
const proveedores = ref(Array.from({ length: 20 }, (_, i) => ({ id: i + 1, nombre: `Proveedor ${i + 1}`, documento: `30${20000000 + i}` })));
const productos = ref([{ id: 100, nombre: "Yerba Mate 1kg", precioUnitario: 5600 }, { id: 101, nombre: "Azucar 1kg", precioUnitario: 2100 }, { id: 102, nombre: "Arroz 1kg", precioUnitario: 2300 }]);
const formasDePago = ref([{ id: 1, nombre: "Efectivo" }, { id: 2, nombre: "Transferencia" }, { id: 3, nombre: "Tarjeta" }]);
const compras = ref(Array.from({ length: 24 }, (_, i) => ({ id: 700 + i, numeroComprobante: `C-0001-${String(6000 + i).padStart(8, "0")}`, fecha: new Date(hoy.getFullYear(), hoy.getMonth(), (i % 28) + 1).toISOString(), idProveedor: (i % 20) + 1 })));
const devoluciones = ref(Array.from({ length: 14 }, (_, i) => { const idProducto = 100 + (i % 3); const cantidad = 1 + (i % 2); const precioUnitario = 2200 + i * 120; return { id: i + 1, idCompra: compras.value[i].id, idProveedor: compras.value[i].idProveedor, fecha: compras.value[i].fecha, motivo: "Producto dañado", total: cantidad * precioUnitario, estado: 1, detalles: [{ idProducto, cantidad, precioUnitario, subtotal: cantidad * precioUnitario }], pagos: i % 2 === 0 ? [{ idFormaPago: 1, importe: cantidad * precioUnitario, referencia: "Reintegro mock" }] : [] }; }));
const devolucionesFiltradas = ref([...devoluciones.value]);
const openModal = ref(false);
const openDetalleModal = ref(false);
const devolucionDetalle = ref<any | null>(null);
const compraOpen = ref(false);
const compraSearch = ref("");
const proveedorSearch = ref("");
const compraBox = ref<HTMLElement | null>(null);
const pagarTodo = ref(false);
const form = ref({ idCompra: 0, idProveedor: 0, motivo: "", pagos: [] as Array<{ idFormaPago: number; importe: number; referencia: string }> });
const detallesCompraActual = ref<Array<{ idProducto: number; productoNombre: string; cantidadComprada: number; precioUnitario: number; cantidadDevolver: number }>>([]);
const totalPaginas = computed(() => Math.max(1, Math.ceil(devolucionesFiltradas.value.length / pageSize)));
const devolucionesPaginadas = computed(() => devolucionesFiltradas.value.slice((page.value - 1) * pageSize, page.value * pageSize));
const compraSearchLabel = (c: { numeroComprobante: string; idProveedor: number; fecha: string }) => `${c.numeroComprobante} - ${nombreProveedor(c.idProveedor)} - ${formatDate(c.fecha)}`;
const comprasFiltradasBusqueda = computed(() => compras.value.filter(c => compraSearchLabel(c).toLowerCase().includes(compraSearch.value.toLowerCase())).slice(0, 8));
const detallesCalculados = computed(() => detallesCompraActual.value.filter(d => (d.cantidadDevolver || 0) > 0));
const totalCalculado = computed(() => detallesCalculados.value.reduce((acc, d) => acc + d.cantidadDevolver * d.precioUnitario, 0));
const nombreProveedor = (idProveedor: number) => proveedores.value.find(x => x.id === idProveedor)?.nombre || `Proveedor #${idProveedor}`;
const nombreProducto = (idProducto: number) => productos.value.find(p => p.id === idProducto)?.nombre || `Producto #${idProducto}`;
const nombreFormaPago = (idFormaPago: number) => formasDePago.value.find(f => f.id === idFormaPago)?.nombre || `Forma #${idFormaPago}`;
const formatDate = (value: string) => (value ? new Date(value).toLocaleDateString("es-AR") : "-");
const money = (value: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 }).format(value || 0);
const compraLabel = (idCompra: number) => compras.value.find(c => c.id === idCompra)?.numeroComprobante || `#${idCompra}`;
const buscarDevoluciones = () => { const d = new Date(`${desde.value}T00:00:00`); const h = new Date(`${hasta.value}T23:59:59`); if (d > h) return notification.show("La fecha 'desde' no puede ser mayor que 'hasta'", "error"); devolucionesFiltradas.value = devoluciones.value.filter(v => new Date(v.fecha) >= d && new Date(v.fecha) <= h); page.value = 1; };
const abrirCrear = () => { form.value = { idCompra: 0, idProveedor: 0, motivo: "", pagos: [] }; compraSearch.value = ""; proveedorSearch.value = ""; detallesCompraActual.value = []; pagarTodo.value = false; openModal.value = true; };
const cerrarModal = () => (openModal.value = false);
const seleccionarCompra = (c: { id: number; numeroComprobante: string; fecha: string; idProveedor: number }) => { form.value.idCompra = c.id; form.value.idProveedor = c.idProveedor; compraSearch.value = compraSearchLabel(c); proveedorSearch.value = nombreProveedor(c.idProveedor); detallesCompraActual.value = productos.value.map((p, i) => ({ idProducto: p.id, productoNombre: p.nombre, cantidadComprada: 1 + ((c.id + i) % 4), precioUnitario: p.precioUnitario, cantidadDevolver: 0 })); compraOpen.value = false; };
const limpiarCompra = () => { form.value.idCompra = 0; form.value.idProveedor = 0; compraSearch.value = ""; proveedorSearch.value = ""; detallesCompraActual.value = []; };
const agregarPago = () => form.value.pagos.push({ idFormaPago: 0, importe: 0, referencia: "" });
const quitarPago = (idx: number) => form.value.pagos.splice(idx, 1);
const togglePagarTodo = () => { if (pagarTodo.value) { form.value.pagos = [{ idFormaPago: 0, importe: totalCalculado.value, referencia: "Pago total" }]; return; } form.value.pagos = []; };
const guardarDevolucion = () => {
  if (!form.value.idCompra) return notification.show("Seleccioná una compra", "error");
  if (!detallesCalculados.value.length) return notification.show("Indicá al menos una cantidad a devolver", "error");
  if (pagarTodo.value && form.value.pagos.length) form.value.pagos[0].importe = totalCalculado.value;
  const pagosSinForma = form.value.pagos.some(p => p.importe > 0 && p.idFormaPago <= 0);
  if (pagosSinForma) return notification.show("Todos los pagos con importe deben tener forma de pago seleccionada", "error");
  const pagosValidos = form.value.pagos.filter(p => p.idFormaPago > 0 && p.importe > 0);
  const totalPagado = pagosValidos.reduce((acc, p) => acc + p.importe, 0);
  if (totalPagado > totalCalculado.value) return notification.show("Los pagos no pueden superar el total de la devolución", "error");
  devoluciones.value.unshift({ id: Math.max(...devoluciones.value.map(v => v.id), 0) + 1, idCompra: form.value.idCompra, idProveedor: form.value.idProveedor, fecha: new Date().toISOString(), motivo: form.value.motivo, estado: 1, total: totalCalculado.value, detalles: detallesCalculados.value.map(d => ({ idProducto: d.idProducto, cantidad: d.cantidadDevolver, precioUnitario: d.precioUnitario, subtotal: d.cantidadDevolver * d.precioUnitario })), pagos: pagosValidos });
  buscarDevoluciones(); openModal.value = false; notification.show("Devolución de compra registrada correctamente (mock)", "success");
};
const verDetalle = (id: number) => { const d = devoluciones.value.find(x => x.id === id); if (!d) return; devolucionDetalle.value = { ...d, detalles: d.detalles || [], pagos: d.pagos || [] }; openDetalleModal.value = true; };
const cerrarDetalleModal = () => { openDetalleModal.value = false; devolucionDetalle.value = null; };
const handleClickOutside = (event: MouseEvent) => { const target = event.target as Node; if (compraBox.value && !compraBox.value.contains(target)) compraOpen.value = false; };
onMounted(() => document.addEventListener("click", handleClickOutside));
onBeforeUnmount(() => document.removeEventListener("click", handleClickOutside));
buscarDevoluciones();
</script>
