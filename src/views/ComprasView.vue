<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Compras</h1>

    <div class="bg-white rounded-xl shadow p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
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
        <tr v-if="comprasStore.loading">
          <td colspan="8" class="text-center py-4 text-gray-400">Cargando compras...</td>
        </tr>
        <tr v-else v-for="c in comprasPaginadas" :key="c.id" class="border-b hover:bg-gray-50">
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
          <td class="p-2">
            <div class="flex items-center justify-end gap-2">
              <button
                v-if="c.estado !== 2 && c.saldoPendiente > 0"
                @click="abrirPagoCompra(c)"
                class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-emerald-600 transition hover:bg-emerald-50"
                title="Pagar compra"
                type="button"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="h-5 w-5"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v18" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 7.5c0-1.9-2-3.5-4.5-3.5S7.5 5.6 7.5 7.5 9.5 11 12 11s4.5 1.6 4.5 3.5S14.5 18 12 18s-4.5-1.6-4.5-3.5" />
                </svg>
              </button>
              <button
                @click="verDetalle(c.id)"
                class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-blue-500 transition hover:bg-blue-50"
                title="Ver detalle"
                type="button"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="h-5 w-5"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
              <button
                v-if="c.estado !== 2"
                @click="anular(c.id)"
                class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-red-500 transition hover:bg-red-50"
                title="Anular compra"
                type="button"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="h-5 w-5"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 6V4h8v2" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 6l-1 14H6L5 6" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 11v6M14 11v6" />
                </svg>
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="!comprasStore.loading && comprasFiltradas.length === 0">
          <td colspan="8" class="text-center py-4 text-gray-400">No hay compras</td>
        </tr>
      </tbody>
    </table>

    <div class="flex justify-center items-center gap-2 mt-4">
      <button @click="page--" :disabled="page === 1" class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">&larr;</button>
      <span class="text-sm">Pagina {{ page }} de {{ totalPaginas }}</span>
      <button @click="page++" :disabled="page === totalPaginas" class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">&rarr;</button>
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
            <div ref="proveedorBox" class="relative">
              <label class="text-sm text-gray-700">Proveedor *</label>
              <div class="relative">
                <input v-model="proveedorSearch" class="w-full border px-3 py-2 rounded-md pr-8" placeholder="Buscar proveedor" @focus="proveedorOpen = true" />
                <button v-if="form.idProveedor > 0 || proveedorSearch" type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-sm" @click="limpiarProveedor">x</button>
              </div>
              <div v-if="proveedorOpen && proveedoresFiltrados.length" class="absolute z-20 w-full mt-1 bg-white border rounded-md shadow max-h-44 overflow-y-auto">
                <button v-for="p in proveedoresFiltrados" :key="p.id" type="button" class="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm" @click="seleccionarProveedor(p)">
                  {{ p.razonSocial }}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label class="text-sm text-gray-700">Observaciones</label>
            <textarea v-model="form.observaciones" rows="2" class="w-full border px-3 py-2 rounded-md"></textarea>
          </div>

          <div class="border rounded-lg p-4 bg-gray-50/50">
            <div class="flex justify-between items-center mb-3">
              <div>
                <h3 class="font-semibold text-gray-800">Detalle de productos</h3>
                <p class="text-xs text-gray-500">Primero elegi un producto, despues completa cantidad y precio unitario.</p>
              </div>
            </div>

            <div class="rounded-lg border border-dashed border-gray-300 bg-white p-4 mb-3">
              <div class="grid grid-cols-1 md:grid-cols-5 gap-3 md:items-start">
                <div ref="productoBox" class="relative md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">1. Producto</label>
                  <div class="relative">
                    <input
                      v-model="productoSearch"
                      class="border px-3 py-2 rounded-md w-full pr-8"
                      placeholder="Escribe para buscar un producto"
                      @focus="productoOpen = true"
                    />
                    <button v-if="nuevoDetalle.idProducto > 0 || productoSearch" type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-sm" @click="limpiarProducto">x</button>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">Busca por nombre y seleccionalo de la lista.</p>
                  <div v-if="nuevoDetalle.idProducto > 0" class="mt-2 rounded-md bg-blue-50 text-blue-800 px-3 py-2 text-sm border border-blue-100">
                    <div>
                      Producto seleccionado: <span class="font-semibold">{{ nombreProducto(nuevoDetalle.idProducto) }}</span>
                    </div>
                    <div class="mt-1">
                      Stock actual: <span class="font-semibold">{{ stockProducto(nuevoDetalle.idProducto) }}</span>
                    </div>
                    <div class="mt-1">
                      Precio compra actual: <span class="font-semibold">{{ precioCompraProducto(nuevoDetalle.idProducto) }}</span>
                    </div>
                  </div>
                  <div v-if="productoOpen && productosFiltrados.length" class="absolute z-20 w-full mt-1 bg-white border rounded-md shadow max-h-52 overflow-y-auto">
                    <button v-for="prod in productosFiltrados" :key="prod.id" type="button" class="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm" @click="seleccionarProducto(prod)">
                      <div class="font-medium text-gray-800">{{ prod.nombre }}</div>
                      <div class="text-xs text-gray-500">Stock actual: {{ prod.stockActual }}</div>
                      <div class="text-xs text-gray-500">Precio compra: {{ money(prod.precioCompra ?? 0) }}</div>
                    </button>
                  </div>
                </div>

                <div class="flex flex-col">
                  <label class="block text-sm font-medium text-gray-700 mb-1">2. Cantidad</label>
                  <input
                    v-model.number="nuevoDetalle.cantidad"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Ej: 10"
                    :disabled="nuevoDetalle.idProducto <= 0"
                    class="border px-3 py-2 rounded-md w-full disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    @keydown="bloquearDecimal"
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    {{ nuevoDetalle.idProducto > 0 ? "Solo numeros enteros." : "Primero selecciona un producto." }}
                  </p>
                </div>

                <div class="flex flex-col">
                  <label class="block text-sm font-medium text-gray-700 mb-1">3. Precio unitario</label>
                  <input
                    v-model.number="nuevoDetalle.precioUnitario"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Ej: 2500"
                    :disabled="nuevoDetalle.idProducto <= 0"
                    class="border px-3 py-2 rounded-md w-full disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    @keydown="bloquearDecimal"
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    {{ nuevoDetalle.idProducto > 0 ? "Valor por unidad, sin decimales." : "Se habilita al elegir un producto." }}
                  </p>
                </div>

                <div class="flex flex-col md:self-start">
                  <label class="block text-sm font-medium text-gray-700 mb-1">4. Accion</label>
                  <button
                    @click="agregarDetalle"
                    :disabled="nuevoDetalle.idProducto <= 0"
                    class="w-full bg-blue-600 text-white rounded-md px-3 py-2 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                  >
                    Agregar al detalle
                  </button>
                </div>
              </div>
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
                    <td class="px-3 py-2">
                      <div>{{ nombreProducto(d.idProducto) }}</div>
                      <div class="text-xs text-gray-500">Stock actual: {{ stockProducto(d.idProducto) }}</div>
                      <div class="text-xs text-gray-500">Precio compra actual: {{ precioCompraProducto(d.idProducto) }}</div>
                    </td>
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
                  min="0.01"
                  step="0.01"
                  placeholder="Importe"
                  class="border px-3 py-2 rounded-md"
                />
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
          <li v-for="(d, index) in compraDetalle.detalles || []" :key="d.id ?? `${d.idProducto}-${index}`" class="text-sm border-b py-1">
            {{ nombreProducto(d.idProducto) }} - Cantidad: {{ d.cantidad }} - PU: {{ money(d.precioUnitario) }} - Subtotal: {{ money(d.subtotal || d.cantidad * d.precioUnitario) }}
          </li>
        </ul>
        <h3 class="font-semibold mb-1">Pagos</h3>
        <ul>
          <li v-for="(p, index) in compraDetalle.pagos || []" :key="p.id ?? `${p.idFormaPago}-${index}`" class="text-sm border-b py-1">
            {{ nombreFormaPago(p.idFormaPago) }} - {{ money(p.importe) }} - {{ p.referencia || "-" }}
          </li>
          <li v-if="!(compraDetalle.pagos?.length)" class="text-sm text-gray-400">Sin pagos registrados</li>
        </ul>
      </div>
    </div>

    <div
      v-if="openPagoModal && compraPagoSeleccionada"
      class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 class="text-lg font-bold text-gray-800">Pagar compra</h2>
            <p class="text-sm text-gray-500">
              {{ compraPagoSeleccionada.numeroComprobante }} - {{ nombreProveedor(compraPagoSeleccionada.idProveedor) }}
            </p>
          </div>
          <button @click="cerrarPagoCompra" class="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300">Cerrar</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div class="rounded-lg border bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-wide text-slate-500">Total</div>
            <div class="mt-1 text-2xl font-semibold text-slate-900">{{ money(compraPagoSeleccionada.total) }}</div>
          </div>
          <div class="rounded-lg border bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-wide text-slate-500">Total pagado</div>
            <div class="mt-1 text-2xl font-semibold text-slate-900">{{ money(compraPagoSeleccionada.totalPagado) }}</div>
          </div>
          <div class="rounded-lg border bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-wide text-slate-500">Saldo pendiente</div>
            <div class="mt-1 text-2xl font-semibold text-slate-900">{{ money(compraPagoSeleccionada.saldoPendiente) }}</div>
          </div>
        </div>

        <div class="rounded-lg border mb-4 overflow-hidden">
          <div class="border-b bg-gray-50 px-4 py-3">
            <h3 class="font-semibold text-gray-800">Resumen de la compra</h3>
            <p class="text-xs text-gray-500">Detalle simple para decidir cuanto pagar.</p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[680px]">
              <thead class="bg-white text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th class="px-4 py-3">Fecha</th>
                  <th class="px-4 py-3">Comprobante</th>
                  <th class="px-4 py-3 text-right">Total</th>
                  <th class="px-4 py-3 text-right">Pagado</th>
                  <th class="px-4 py-3 text-right">Pendiente</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-gray-700">{{ formatDate(compraPagoSeleccionada.fecha) }}</td>
                  <td class="px-4 py-3 text-sm font-medium text-gray-800">{{ compraPagoSeleccionada.numeroComprobante }}</td>
                  <td class="px-4 py-3 text-sm text-right text-gray-700">{{ money(compraPagoSeleccionada.total) }}</td>
                  <td class="px-4 py-3 text-sm text-right text-emerald-700">{{ money(compraPagoSeleccionada.totalPagado) }}</td>
                  <td class="px-4 py-3 text-sm text-right font-semibold text-amber-700">{{ money(compraPagoSeleccionada.saldoPendiente) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="rounded-lg border p-4">
          <h3 class="font-semibold text-gray-800 mb-3">Registrar pago</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="text-sm text-gray-700">Forma de pago *</label>
              <select v-model.number="pagoCompraForm.idFormaPago" class="w-full border px-3 py-2 rounded-md">
                <option :value="0">Seleccionar</option>
                <option v-for="forma in formasDePago" :key="forma.id" :value="forma.id">{{ forma.nombre }}</option>
              </select>
            </div>
            <div>
              <div class="flex items-center justify-between gap-3">
                <label class="text-sm text-gray-700">Importe *</label>
                <button
                  v-if="compraPagoSeleccionada.saldoPendiente > 0"
                  type="button"
                  class="text-sm text-emerald-700 hover:text-emerald-800"
                  @click="usarSaldoPendienteCompra"
                >
                  Usar saldo
                </button>
              </div>
              <input v-model.number="pagoCompraForm.importe" type="number" min="0.01" step="0.01" class="w-full border px-3 py-2 rounded-md" />
            </div>
            <div class="flex items-end">
              <button
                @click="guardarPagoCompra"
                :disabled="compraPagoSeleccionada.saldoPendiente <= 0"
                class="w-full bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
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
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useComprasStore } from "@/modules/compras/store";
import type { Compra } from "@/modules/compras/types";
import { useFormasDePagoStore } from "@/modules/formasDePagos/store";
import { useProductosStore } from "@/modules/productos/store";
import type { Producto } from "@/modules/productos/types";
import { useProveedoresStore } from "@/modules/proveedores/store";
import type { Proveedor } from "@/modules/proveedores/types";
import { useNotificationStore } from "@/stores/notificaciones";

const notification = useNotificationStore();
const comprasStore = useComprasStore();
const proveedoresStore = useProveedoresStore();
const productosStore = useProductosStore();
const formasDePagoStore = useFormasDePagoStore();

const padDatePart = (value: number) => String(value).padStart(2, "0");
const toLocalInputDate = (date: Date) =>
  `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
const parseApiDate = (value: string) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parts = value.split("-").map(Number);
    const year = parts[0] ?? 0;
    const month = parts[1] ?? 1;
    const day = parts[2] ?? 1;
    return new Date(year, month - 1, day);
  }
  return new Date(value);
};

const hoy = new Date();
const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

const desde = ref(toLocalInputDate(primerDiaMes));
const hasta = ref(toLocalInputDate(hoy));
const page = ref(1);
const pageSize = 10;

const openModal = ref(false);
const openDetalleModal = ref(false);
const openPagoModal = ref(false);
const compraDetalle = ref<Compra | null>(null);
const compraPagoSeleccionada = ref<Compra | null>(null);
const proveedorOpen = ref(false);
const productoOpen = ref(false);
const proveedorSearch = ref("");
const productoSearch = ref("");
const proveedorBox = ref<HTMLElement | null>(null);
const productoBox = ref<HTMLElement | null>(null);

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

const pagarTodo = ref(false);
const pagoCompraForm = ref({
  idFormaPago: 0,
  importe: 0
});

const proveedores = computed(() => proveedoresStore.proveedores.filter(p => p.activo));
const productos = computed(() => productosStore.productos.filter(p => p.activo));
const formasDePago = computed(() => formasDePagoStore.formasDePago);
const comprasFiltradas = computed(() => comprasStore.compras);
const totalPaginas = computed(() => Math.max(1, Math.ceil(comprasFiltradas.value.length / pageSize)));
const comprasPaginadas = computed(() => {
  const start = (page.value - 1) * pageSize;
  return comprasFiltradas.value.slice(start, start + pageSize);
});
const totalCalculado = computed(() => form.value.detalles.reduce((acc, d) => acc + (Number(d.cantidad) || 0) * (Number(d.precioUnitario) || 0), 0));
const proveedoresFiltrados = computed(() => proveedores.value.filter(p => p.razonSocial.toLowerCase().includes(proveedorSearch.value.toLowerCase())).slice(0, 8));
const productosFiltrados = computed(() => productos.value.filter(p => p.nombre.toLowerCase().includes(productoSearch.value.toLowerCase())).slice(0, 10));

const buscarCompras = async () => {
  if (!desde.value || !hasta.value) {
    page.value = 1;
    return;
  }

  const desdeDate = new Date(`${desde.value}T00:00:00`);
  const hastaDate = new Date(`${hasta.value}T23:59:59`);

  if (Number.isNaN(desdeDate.getTime()) || Number.isNaN(hastaDate.getTime())) {
    notification.show("Las fechas ingresadas no son validas", "error");
    return;
  }

  if (desdeDate > hastaDate) {
    notification.show("La fecha 'desde' no puede ser mayor que 'hasta'", "error");
    return;
  }

  await comprasStore.fetchCompras(desde.value, hasta.value);
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
  pagarTodo.value = false;
  proveedorSearch.value = "";
  productoSearch.value = "";
  proveedorOpen.value = false;
  productoOpen.value = false;
  openModal.value = true;
};

const cerrarModal = () => {
  openModal.value = false;
};

const abrirPagoCompra = (compra: Compra) => {
  compraPagoSeleccionada.value = compra;
  pagoCompraForm.value = { idFormaPago: 0, importe: 0 };
  openPagoModal.value = true;
};

const cerrarPagoCompra = () => {
  openPagoModal.value = false;
  compraPagoSeleccionada.value = null;
  pagoCompraForm.value = { idFormaPago: 0, importe: 0 };
};

const seleccionarProveedor = (proveedor: Proveedor) => {
  form.value.idProveedor = proveedor.id;
  proveedorSearch.value = proveedor.razonSocial;
  proveedorOpen.value = false;
};

const limpiarProveedor = () => {
  form.value.idProveedor = 0;
  proveedorSearch.value = "";
};

const seleccionarProducto = (producto: Producto) => {
  nuevoDetalle.value.idProducto = producto.id;
  productoSearch.value = producto.nombre;
  productoOpen.value = false;
};

const limpiarProducto = () => {
  nuevoDetalle.value.idProducto = 0;
  productoSearch.value = "";
};

const agregarDetalle = () => {
  const { idProducto, cantidad, precioUnitario } = nuevoDetalle.value;
  if (idProducto <= 0) return notification.show("Selecciona un producto", "error");
  if (cantidad <= 0 || !Number.isInteger(cantidad)) return notification.show("La cantidad debe ser un numero entero mayor a 0", "error");
  if (precioUnitario <= 0 || !Number.isInteger(precioUnitario)) return notification.show("El precio unitario debe ser un numero entero mayor a 0", "error");
  if (form.value.detalles.some(d => d.idProducto === idProducto)) return notification.show("Ese producto ya esta agregado en la tabla", "error");

  form.value.detalles.push({ idProducto, cantidad, precioUnitario });
  nuevoDetalle.value = { idProducto: 0, cantidad: 1, precioUnitario: 0 };
  productoSearch.value = "";
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

const togglePagarTodo = () => {
  if (pagarTodo.value) {
    form.value.pagos = [{ idFormaPago: 0, importe: totalCalculado.value, referencia: "Pago total" }];
    return;
  }
  form.value.pagos = [];
};

const bloquearDecimal = (event: KeyboardEvent) => {
  if (event.key === "." || event.key === ",") {
    event.preventDefault();
  }
};

const guardarCompra = async () => {
  if (!form.value.numeroComprobante.trim()) return notification.show("El numero de comprobante es obligatorio", "error");
  if (form.value.idProveedor <= 0) return notification.show("Debe seleccionar un proveedor", "error");
  if (form.value.idSucursal <= 0) return notification.show("La sucursal es obligatoria", "error");
  if (!form.value.detalles.length) return notification.show("Debe agregar al menos un detalle", "error");

  if (pagarTodo.value && form.value.pagos.length) {
    const primerPago = form.value.pagos[0];
    if (primerPago) {
      primerPago.importe = totalCalculado.value;
    }
  }

  for (const d of form.value.detalles) {
    if (d.idProducto <= 0 || d.cantidad <= 0 || d.precioUnitario <= 0) {
      return notification.show("Revisa los detalles: producto, cantidad y precio deben ser mayores a 0", "error");
    }
    if (!Number.isInteger(d.cantidad)) {
      return notification.show("La cantidad debe ser un numero entero", "error");
    }
  }

  const detalles = form.value.detalles.map(d => ({
    idProducto: d.idProducto,
    cantidad: d.cantidad,
    precioUnitario: d.precioUnitario,
  }));

  const pagos = form.value.pagos
    .filter(p => p.idFormaPago > 0 && p.importe > 0)
    .map(p => ({
      idFormaPago: p.idFormaPago,
      importe: p.importe,
      referencia: p.referencia,
    }));

  const total = form.value.detalles.reduce((acc, d) => acc + d.cantidad * d.precioUnitario, 0);
  const totalPagado = pagos.reduce((acc, p) => acc + p.importe, 0);
  if (totalPagado > total) {
    return notification.show("Los pagos no pueden superar el total de la compra", "error");
  }

  const idCompra = await comprasStore.addCompra({
    numeroComprobante: form.value.numeroComprobante.trim(),
    idProveedor: form.value.idProveedor,
    idSucursal: form.value.idSucursal,
    observaciones: form.value.observaciones?.trim() || undefined,
    detalles,
    pagos,
  });

  if (!idCompra) return;

  openModal.value = false;
  await Promise.all([
    buscarCompras(),
    productosStore.fetchProductos(),
  ]);
};

const verDetalle = async (id: number) => {
  compraDetalle.value = await comprasStore.fetchCompraPorId(id);
  if (!compraDetalle.value) return;
  openDetalleModal.value = true;
};

const anular = async (id: number) => {
  const ok = await comprasStore.cancelarCompra(id);
  if (!ok) return;
  await Promise.all([
    buscarCompras(),
    productosStore.fetchProductos(),
  ]);
};

const usarSaldoPendienteCompra = () => {
  if (!compraPagoSeleccionada.value) return;
  pagoCompraForm.value.importe = compraPagoSeleccionada.value.saldoPendiente;
};

const guardarPagoCompra = async () => {
  if (!compraPagoSeleccionada.value) return;

  const { idFormaPago, importe } = pagoCompraForm.value;
  if (compraPagoSeleccionada.value.saldoPendiente <= 0) {
    return notification.show("La compra no tiene saldo pendiente para pagar", "error");
  }
  if (idFormaPago <= 0) return notification.show("Debe seleccionar una forma de pago", "error");
  if (importe <= 0) return notification.show("El importe debe ser mayor a 0", "error");
  if (importe > compraPagoSeleccionada.value.saldoPendiente) {
    return notification.show("El importe no puede superar el saldo pendiente", "error");
  }

  const ok = await comprasStore.registrarPagoCompra({
    idCompra: compraPagoSeleccionada.value.id,
    importe,
    idFormaPago
  });

  if (!ok) return;

  const idCompra = compraPagoSeleccionada.value.id;
  await buscarCompras();
  compraPagoSeleccionada.value = await comprasStore.fetchCompraPorId(idCompra);
  pagoCompraForm.value = { idFormaPago: 0, importe: 0 };

  if (!compraPagoSeleccionada.value || compraPagoSeleccionada.value.saldoPendiente <= 0) {
    cerrarPagoCompra();
  }
};

const nombreProveedor = (idProveedor: number) => {
  const proveedor = proveedoresStore.proveedores.find(x => x.id === idProveedor);
  return proveedor?.razonSocial || `Proveedor #${idProveedor}`;
};

const nombreFormaPago = (idFormaPago: number) => {
  const forma = formasDePagoStore.formasDePago.find(x => x.id === idFormaPago);
  return forma?.nombre || `Forma #${idFormaPago}`;
};

const nombreProducto = (idProducto: number) => {
  const producto = productosStore.productos.find(x => x.id === idProducto);
  return producto?.nombre || `Producto #${idProducto}`;
};

const stockProducto = (idProducto: number) => {
  const producto = productosStore.productos.find(x => x.id === idProducto);
  return producto?.stockActual ?? "-";
};

const precioCompraProducto = (idProducto: number) => {
  const producto = productosStore.productos.find(x => x.id === idProducto);
  return money(producto?.precioCompra ?? 0);
};

const money = (value: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 }).format(value || 0);

const formatoMiles = (value: number) => new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(value || 0);

const formatDate = (value: string) => {
  if (!value) return "-";
  return parseApiDate(value).toLocaleDateString("es-AR");
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  if (proveedorBox.value && !proveedorBox.value.contains(target)) proveedorOpen.value = false;
  if (productoBox.value && !productoBox.value.contains(target)) productoOpen.value = false;
};

onMounted(async () => {
  document.addEventListener("click", handleClickOutside);
  await Promise.all([
    proveedoresStore.fetchProveedores(),
    productosStore.fetchProductos(),
    formasDePagoStore.fetchFormasDePago(),
    buscarCompras(),
  ]);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
