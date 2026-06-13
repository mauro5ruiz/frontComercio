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
      <div ref="filtroClienteBox" class="relative">
        <label class="text-sm text-gray-600">Cliente</label>
        <div class="relative">
          <input
            v-model="filtroClienteSearch"
            class="w-full border px-3 py-2 rounded-md pr-8"
            placeholder="Filtrar por cliente"
            @focus="filtroClienteOpen = true"
            @input="filtroClienteId = 0; page = 1"
          />
          <button
            v-if="filtroClienteId > 0 || filtroClienteSearch"
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-sm"
            @click="limpiarFiltroCliente"
          >
            x
          </button>
        </div>
        <div v-if="filtroClienteOpen && clientesFiltroBusqueda.length" class="absolute z-20 w-full mt-1 bg-white border rounded-md shadow max-h-44 overflow-y-auto">
          <button
            v-for="c in clientesFiltroBusqueda"
            :key="c.id"
            type="button"
            class="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
            @click="seleccionarFiltroCliente(c)"
          >
            {{ c.nombreCompleto }} - Doc {{ c.nroDocumento || "-" }}
          </button>
        </div>
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
        <tr v-if="ventasStore.loading">
          <td colspan="8" class="text-center py-4 text-gray-400">Cargando ventas...</td>
        </tr>
        <tr v-else v-for="v in ventasPaginadas" :key="v.id" class="border-b hover:bg-gray-50">
          <td class="p-2">{{ formatDate(v.fecha) }}</td>
          <td class="p-2">{{ v.numeroComprobante }}</td>
          <td class="p-2">{{ nombreCliente(v.idCliente) }}</td>
          <td class="p-2 text-right">{{ money(v.total) }}</td>
          <td class="p-2 text-right">{{ money(v.totalPagado) }}</td>
          <td class="p-2 text-right">{{ money(v.saldoPendiente) }}</td>
          <td class="p-2">
            <span :class="estaAnulada(v.estado) ? 'text-red-600' : 'text-green-600'">
              {{ estaAnulada(v.estado) ? "Anulada" : "Activa" }}
            </span>
          </td>
          <td class="p-2">
            <div class="flex items-center justify-end gap-2">
              <button
                v-if="!estaAnulada(v.estado) && Number(v.saldoPendiente) > 0"
                @click="abrirCobroVenta(v)"
                class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-emerald-600 transition hover:bg-emerald-50"
                title="Cobrar venta"
                type="button"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v18" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 7.5c0-1.9-2-3.5-4.5-3.5S7.5 5.6 7.5 7.5 9.5 11 12 11s4.5 1.6 4.5 3.5S14.5 18 12 18s-4.5-1.6-4.5-3.5" />
                </svg>
              </button>
              <button
                @click="verDetalle(v.id)"
                class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-blue-500 transition hover:bg-blue-50"
                title="Ver detalle"
                type="button"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
              <button
                v-if="!estaAnulada(v.estado)"
                @click="abrirConfirmacionAnulacion(v.id)"
                class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-red-500 transition hover:bg-red-50"
                title="Anular venta"
                type="button"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 6V4h8v2" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 6l-1 14H6L5 6" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 11v6M14 11v6" />
                </svg>
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="!ventasStore.loading && ventasFiltradas.length === 0">
          <td colspan="8" class="text-center py-4 text-gray-400">No hay ventas</td>
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
          <h2 class="text-lg font-bold text-gray-800">Nueva venta</h2>
        </div>

        <div class="p-6 overflow-y-auto space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="text-sm text-gray-700">Nro. comprobante *</label>
              <input v-model="form.numeroComprobante" class="w-full border px-3 py-2 rounded-md" />
            </div>
            <div ref="clienteBox" class="relative">
              <label class="text-sm text-gray-700">Cliente</label>
              <div class="relative">
                <input v-model="clienteSearch" class="w-full border px-3 py-2 rounded-md pr-8" placeholder="Buscar cliente (opcional)" @focus="clienteOpen = true" />
                <button v-if="form.idCliente > 0 || clienteSearch" type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-sm" @click="limpiarCliente">x</button>
              </div>
              <p class="mt-1 text-xs text-gray-500">Si no seleccionas un cliente, la venta se guarda como Consumidor final.</p>
              <div v-if="clienteOpen && clientesFiltrados.length" class="absolute z-20 w-full mt-1 bg-white border rounded-md shadow max-h-44 overflow-y-auto">
                <button v-for="c in clientesFiltrados" :key="c.id" type="button" class="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm" @click="seleccionarCliente(c)">
                  {{ c.nombreCompleto }} - Doc {{ c.nroDocumento || "-" }}
                </button>
              </div>
            </div>
            <div ref="vendedorBox" class="relative">
              <label class="text-sm text-gray-700">Vendedor *</label>
              <div class="relative">
                <input v-model="vendedorSearch" class="w-full border px-3 py-2 rounded-md pr-8" placeholder="Buscar vendedor" @focus="vendedorOpen = true" />
                <button v-if="form.idVendedor > 0 || vendedorSearch" type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-sm" @click="limpiarVendedor">x</button>
              </div>
              <div v-if="vendedorOpen && vendedoresFiltrados.length" class="absolute z-20 w-full mt-1 bg-white border rounded-md shadow max-h-44 overflow-y-auto">
                <button v-for="v in vendedoresFiltrados" :key="v.id" type="button" class="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm" @click="seleccionarVendedor(v)">
                  {{ `${v.nombre} ${v.apellido}`.trim() }}
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
                  <div v-if="productoSeleccionado" class="mt-2 rounded-md bg-blue-50 text-blue-800 px-3 py-2 text-sm border border-blue-100">
                    <div>
                      Producto seleccionado: <span class="font-semibold">{{ productoSeleccionado.nombre }}</span>
                    </div>
                    <div class="mt-1">
                      Marca: <span class="font-semibold">{{ marcaProducto(productoSeleccionado.id) }}</span>
                    </div>
                    <div class="mt-1">
                      Stock actual: <span class="font-semibold">{{ stockProducto(productoSeleccionado.id) }}</span>
                    </div>
                    <div class="mt-1">
                      Precio venta actual: <span class="font-semibold">{{ precioVentaProducto(productoSeleccionado.id) }}</span>
                    </div>
                    <div v-if="ofertaDisponibleNuevoDetalle && precioOfertaNuevoDetalle !== null" class="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">
                      <div>
                        Oferta vigente al registrar la venta:
                        <span class="font-semibold">{{ descripcionOferta(ofertaDisponibleNuevoDetalle) }}</span>
                      </div>
                      <div class="mt-1">
                        Precio oferta: <span class="font-semibold">{{ money(precioOfertaNuevoDetalle) }}</span>
                      </div>
                      <label class="mt-2 inline-flex items-center gap-2 text-sm">
                        <input
                          v-model="usarPrecioOriginalNuevoDetalle"
                          type="checkbox"
                          @change="togglePrecioOriginalNuevoDetalle"
                        />
                        Vender al precio original
                      </label>
                    </div>
                  </div>
                  <div v-if="productoOpen && productosFiltrados.length" class="absolute z-20 w-full mt-1 bg-white border rounded-md shadow max-h-52 overflow-y-auto">
                    <button v-for="prod in productosFiltrados" :key="prod.id" type="button" class="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm" @click="seleccionarProducto(prod)">
                      <div class="font-medium text-gray-800">{{ prod.nombre }}</div>
                      <div class="text-xs text-gray-500">Marca: {{ nombreMarcaProducto(prod) }}</div>
                      <div class="text-xs text-gray-500">Stock actual: {{ prod.stockActual }}</div>
                      <div class="text-xs text-gray-500">Precio venta: {{ money(prod.precioVenta ?? 0) }}</div>
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
                </div>

                <div class="flex flex-col">
                  <label class="block text-sm font-medium text-gray-700 mb-1">3. Precio unitario</label>
                  <input
                    :value="nuevoDetallePrecioInput"
                    type="text"
                    inputmode="numeric"
                    placeholder="Ej: 2500"
                    :disabled="nuevoDetalle.idProducto <= 0"
                    class="border px-3 py-2 rounded-md w-full disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    @input="actualizarNuevoDetallePrecio"
                  />
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
                      <div class="text-xs text-gray-500">Marca: {{ marcaProducto(d.idProducto) }}</div>
                      <div class="text-xs text-gray-500">Stock actual: {{ stockProducto(d.idProducto) }}</div>
                      <div v-if="d.tieneOferta && d.precioOferta !== null" class="mt-2 text-xs text-emerald-700">
                        <div>Precio oferta: {{ money(d.precioOferta) }}</div>
                        <label class="mt-1 inline-flex items-center gap-2 text-gray-700">
                          <input
                            v-model="d.usarPrecioOriginal"
                            type="checkbox"
                            @change="togglePrecioOriginalDetalle(idx)"
                          />
                          Vender al precio original
                        </label>
                      </div>
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
              <h3 class="font-semibold">{{ esConsumidorFinal ? "Pagos iniciales (obligatorio)" : "Pagos iniciales (opcional)" }}</h3>
              <div class="flex items-center gap-3">
                <label class="text-sm flex items-center gap-1">
                  <input type="checkbox" v-model="pagarTodo" :disabled="esConsumidorFinal" @change="togglePagarTodo" />
                  Pagar todo
                </label>
                <button @click="agregarPago" class="text-blue-600 text-sm" :disabled="pagarTodo">+ Agregar pago</button>
              </div>
            </div>
            <p v-if="esConsumidorFinal" class="mb-2 text-xs text-amber-700">
              Para Consumidor final la venta debe quedar pagada en su totalidad.
            </p>
            <div class="space-y-2">
              <div v-for="(p, idx) in form.pagos" :key="idx" class="grid grid-cols-1 md:grid-cols-4 gap-2">
                <select v-model.number="p.idFormaPago" class="border px-3 py-2 rounded-md">
                  <option :value="0">-- Seleccione la forma de pago --</option>
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
                <button
                  @click="quitarPago(idx)"
                  :disabled="esConsumidorFinal"
                  class="bg-red-100 text-red-600 rounded-md px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Quitar
                </button>
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

    <div
      v-if="openCobroVentaModal && ventaCobroSeleccionada"
      class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 class="text-lg font-bold text-gray-800">Cobrar venta</h2>
            <p class="text-sm text-gray-500">
              {{ ventaCobroSeleccionada.numeroComprobante }} - {{ nombreCliente(ventaCobroSeleccionada.idCliente) }}
            </p>
          </div>
          <button @click="cerrarCobroVenta" class="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300">Cerrar</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div class="rounded-lg border bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-wide text-slate-500">Total</div>
            <div class="mt-1 text-2xl font-semibold text-slate-900">{{ money(ventaCobroSeleccionada.total) }}</div>
          </div>
          <div class="rounded-lg border bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-wide text-slate-500">Total cobrado</div>
            <div class="mt-1 text-2xl font-semibold text-slate-900">{{ money(ventaCobroSeleccionada.totalPagado) }}</div>
          </div>
          <div class="rounded-lg border bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-wide text-slate-500">Saldo pendiente</div>
            <div class="mt-1 text-2xl font-semibold text-slate-900">{{ money(ventaCobroSeleccionada.saldoPendiente) }}</div>
          </div>
        </div>

        <div class="rounded-lg border mb-4 overflow-hidden">
          <div class="border-b bg-gray-50 px-4 py-3">
            <h3 class="font-semibold text-gray-800">Resumen de la venta</h3>
            <p class="text-xs text-gray-500">Detalle simple para decidir cuanto cobrar.</p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[680px]">
              <thead class="bg-white text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th class="px-4 py-3">Fecha</th>
                  <th class="px-4 py-3">Comprobante</th>
                  <th class="px-4 py-3 text-right">Total</th>
                  <th class="px-4 py-3 text-right">Cobrado</th>
                  <th class="px-4 py-3 text-right">Pendiente</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-gray-700">{{ formatDate(ventaCobroSeleccionada.fecha) }}</td>
                  <td class="px-4 py-3 text-sm font-medium text-gray-800">{{ ventaCobroSeleccionada.numeroComprobante }}</td>
                  <td class="px-4 py-3 text-sm text-right text-gray-700">{{ money(ventaCobroSeleccionada.total) }}</td>
                  <td class="px-4 py-3 text-sm text-right text-emerald-700">{{ money(ventaCobroSeleccionada.totalPagado) }}</td>
                  <td class="px-4 py-3 text-sm text-right font-semibold text-amber-700">{{ money(ventaCobroSeleccionada.saldoPendiente) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="rounded-lg border p-4">
          <h3 class="font-semibold text-gray-800 mb-3">Registrar cobro</h3>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label class="text-sm text-gray-700">Forma de pago *</label>
              <select v-model.number="cobroVentaForm.idFormaPago" class="w-full border px-3 py-2 rounded-md">
                <option :value="0">Seleccionar</option>
                <option v-for="forma in formasDePago" :key="forma.id" :value="forma.id">{{ forma.nombre }}</option>
              </select>
            </div>
            <div>
              <div class="flex items-center justify-between gap-3">
                <label class="text-sm text-gray-700">Importe *</label>
                <button
                  v-if="ventaCobroSeleccionada.saldoPendiente > 0"
                  type="button"
                  class="text-sm text-emerald-700 hover:text-emerald-800"
                  @click="usarSaldoPendienteVenta"
                >
                  Pago total
                </button>
              </div>
              <input
                :value="cobroVentaImporteInput"
                type="text"
                inputmode="numeric"
                class="w-full border px-3 py-2 rounded-md"
                @input="actualizarCobroVentaImporte"
              />
            </div>
            <div>
              <label class="text-sm text-gray-700">Referencia</label>
              <input v-model="cobroVentaForm.referencia" maxlength="120" class="w-full border px-3 py-2 rounded-md" />
            </div>
            <div class="flex items-end">
              <button
                @click="guardarCobroVenta"
                :disabled="ventaCobroSeleccionada.saldoPendiente <= 0"
                class="w-full bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                Registrar cobro
              </button>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-3">
            El backend registra el cobro sobre el cliente asociado a esta venta.
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="openAnularModal"
      @click.self="cerrarConfirmacionAnulacion"
      class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
        <h2 class="text-lg font-bold mb-3 text-gray-800">Confirmar anulacion</h2>

        <p class="text-sm text-gray-600 mb-4">Estas seguro de que queres anular esta venta?</p>

        <div class="flex justify-end gap-2">
          <button @click="cerrarConfirmacionAnulacion" class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancelar</button>

          <button @click="confirmarAnulacion" class="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600">Anular</button>
        </div>
      </div>
    </div>

    <div v-if="openDetalleModal && ventaDetalle" @click.self="cerrarDetalleModal" class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold mb-4">Detalle venta #{{ ventaDetalle.id }}</h2>
        <div class="grid grid-cols-2 gap-3 text-sm mb-4">
          <p><b>Comprobante:</b> {{ ventaDetalle.numeroComprobante }}</p>
          <p><b>Fecha:</b> {{ formatDate(ventaDetalle.fecha) }}</p>
          <p><b>Cliente:</b> {{ nombreCliente(ventaDetalle.idCliente) }}</p>
          <p><b>Estado:</b> {{ estaAnulada(ventaDetalle.estado) ? "Anulada" : "Activa" }}</p>
          <p><b>Total:</b> {{ money(ventaDetalle.total) }}</p>
          <p><b>Saldo pendiente:</b> {{ money(ventaDetalle.saldoPendiente) }}</p>
        </div>

        <h3 class="font-semibold mb-1">Productos</h3>
        <ul class="mb-4">
          <li v-for="(d, index) in ventaDetalle.detalles || []" :key="d.id ?? `${d.idProducto}-${index}`" class="text-sm border-b py-2">
            {{ nombreProducto(d.idProducto) }} - {{ marcaProducto(d.idProducto) }} - Cantidad: {{ d.cantidad }} - PU:
            {{ money(d.precioUnitario) }} - Subtotal: {{ money(d.subtotal || d.cantidad * d.precioUnitario) }}
          </li>
          <li v-if="!(ventaDetalle.detalles || []).length" class="text-sm text-gray-400">Sin productos</li>
        </ul>

        <h3 class="font-semibold mb-1">Pagos</h3>
        <ul class="mb-5">
          <li v-for="(p, index) in ventaDetalle.pagos || []" :key="p.id ?? `${p.idFormaPago}-${index}`" class="text-sm border-b py-2">
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
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useClientesStore } from "@/modules/clientes/store";
import type { Cliente } from "@/modules/clientes/types";
import { useFormasDePagoStore } from "@/modules/formasDePagos/store";
import { useMarcasStore } from "@/modules/marcas/store";
import { obtenerOfertas } from "@/modules/ofertas/services";
import { TipoDescuento, type Oferta } from "@/modules/ofertas/types";
import { useProductosStore } from "@/modules/productos/store";
import type { Producto } from "@/modules/productos/types";
import { useVendedoresStore } from "@/modules/vendedores/store";
import type { Vendedor } from "@/modules/vendedores/types";
import { useVentasStore } from "@/modules/ventas/store";
import type { Venta } from "@/modules/ventas/types";
import { useNotificationStore } from "@/stores/notificaciones";

interface DetalleVentaEditable {
  idProducto: number;
  cantidad: number;
  precioUnitario: number;
  precioOriginal: number;
  precioOferta: number | null;
  tieneOferta: boolean;
  usarPrecioOriginal: boolean;
}

const notification = useNotificationStore();
const ventasStore = useVentasStore();
const clientesStore = useClientesStore();
const vendedoresStore = useVendedoresStore();
const productosStore = useProductosStore();
const formasDePagoStore = useFormasDePagoStore();
const marcasStore = useMarcasStore();

const padDatePart = (value: number) => String(value).padStart(2, "0");
const toInputDate = (date: Date) => `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
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

const desde = ref(toInputDate(primerDiaMes));
const hasta = ref(toInputDate(hoy));
const page = ref(1);
const pageSize = 10;

const openModal = ref(false);
const openCobroVentaModal = ref(false);
const openAnularModal = ref(false);
const openDetalleModal = ref(false);
const ventaDetalle = ref<Venta | null>(null);
const ventaCobroSeleccionada = ref<Venta | null>(null);
const ventaAAnular = ref<number | null>(null);
const clienteOpen = ref(false);
const productoOpen = ref(false);
const vendedorOpen = ref(false);
const filtroClienteOpen = ref(false);
const clienteBox = ref<HTMLElement | null>(null);
const vendedorBox = ref<HTMLElement | null>(null);
const productoBox = ref<HTMLElement | null>(null);
const filtroClienteBox = ref<HTMLElement | null>(null);

const clienteSearch = ref("");
const productoSearch = ref("");
const vendedorSearch = ref("");
const filtroClienteSearch = ref("");
const filtroClienteId = ref(0);
const ofertas = ref<Oferta[]>([]);
const fechaRegistroVenta = ref(new Date());

const form = ref({
  numeroComprobante: "",
  idCliente: 0,
  idVendedor: 0,
  idSucursal: 1,
  observaciones: "",
  detalles: [] as DetalleVentaEditable[],
  pagos: [] as Array<{ idFormaPago: number; importe: number; referencia?: string }>,
});

const nuevoDetalle = ref({
  idProducto: 0,
  cantidad: 1,
  precioUnitario: 0,
});
const nuevoDetallePrecioInput = ref("");
const usarPrecioOriginalNuevoDetalle = ref(false);
const cobroVentaForm = ref({
  idFormaPago: 0,
  importe: 0,
  referencia: "",
});
const cobroVentaImporteInput = ref("");

const pagarTodo = ref(false);

const clientes = computed(() => clientesStore.clientes.filter(c => c.activo));
const vendedores = computed(() => vendedoresStore.vendedores.filter(v => v.activo));
const productos = computed(() => productosStore.productos.filter(p => p.activo));
const formasDePago = computed(() => formasDePagoStore.formasDePago);
const ventasFiltradas = computed(() => {
  const termino = filtroClienteSearch.value.trim().toLowerCase();

  return ventasStore.ventas.filter((venta) => {
    if (filtroClienteId.value > 0) {
      return Number(venta.idCliente) === Number(filtroClienteId.value);
    }

    if (!termino) {
      return true;
    }

    return nombreCliente(venta.idCliente).toLowerCase().includes(termino);
  });
});
const totalPaginas = computed(() => Math.max(1, Math.ceil(ventasFiltradas.value.length / pageSize)));
const ventasPaginadas = computed(() => {
  const start = (page.value - 1) * pageSize;
  return ventasFiltradas.value.slice(start, start + pageSize);
});
const totalCalculado = computed(() => form.value.detalles.reduce((acc, d) => acc + (Number(d.cantidad) || 0) * (Number(d.precioUnitario) || 0), 0));
const clientesFiltrados = computed(() =>
  clientes.value.filter(c => `${c.nombreCompleto} ${c.nroDocumento || ""}`.toLowerCase().includes(clienteSearch.value.toLowerCase())).slice(0, 8),
);
const clientesFiltroBusqueda = computed(() =>
  clientes.value.filter(c => `${c.nombreCompleto} ${c.nroDocumento || ""}`.toLowerCase().includes(filtroClienteSearch.value.toLowerCase())).slice(0, 8),
);
const productosFiltrados = computed(() =>
  productos.value.filter(p => `${p.nombre} ${p.marca || ""}`.toLowerCase().includes(productoSearch.value.toLowerCase())).slice(0, 10),
);
const vendedoresFiltrados = computed(() =>
  vendedores.value.filter(v => `${v.nombre} ${v.apellido}`.toLowerCase().includes(vendedorSearch.value.toLowerCase())).slice(0, 8),
);
const esConsumidorFinal = computed(() => Number(form.value.idCliente) <= 0);
const productoSeleccionado = computed(() => productosStore.productos.find(x => Number(x.id) === Number(nuevoDetalle.value.idProducto)) ?? null);
const ofertaDisponibleNuevoDetalle = computed(() => obtenerMejorOfertaVigente(nuevoDetalle.value.idProducto, fechaRegistroVenta.value));
const precioOriginalNuevoDetalle = computed(() => obtenerPrecioBaseProducto(nuevoDetalle.value.idProducto));
const precioOfertaNuevoDetalle = computed(() => {
  if (!ofertaDisponibleNuevoDetalle.value) return null;
  return calcularPrecioFinalOferta(ofertaDisponibleNuevoDetalle.value);
});

const buscarVentas = async () => {
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

  await ventasStore.fetchVentas(desde.value, hasta.value);
  page.value = 1;
};

const abrirCrear = () => {
  fechaRegistroVenta.value = new Date();
  form.value = {
    numeroComprobante: "",
    idCliente: 0,
    idVendedor: 0,
    idSucursal: 1,
    observaciones: "",
    detalles: [],
    pagos: [],
  };
  nuevoDetalle.value = { idProducto: 0, cantidad: 1, precioUnitario: 0 };
  nuevoDetallePrecioInput.value = "";
  usarPrecioOriginalNuevoDetalle.value = false;
  pagarTodo.value = false;
  clienteSearch.value = "";
  productoSearch.value = "";
  vendedorSearch.value = "";
  clienteOpen.value = false;
  productoOpen.value = false;
  vendedorOpen.value = false;
  openModal.value = true;
};

const cerrarModal = () => {
  openModal.value = false;
};

const seleccionarCliente = (cliente: Cliente) => {
  form.value.idCliente = cliente.id;
  clienteSearch.value = `${cliente.nombreCompleto} - Doc ${cliente.nroDocumento || "-"}`;
  clienteOpen.value = false;
};

const limpiarCliente = () => {
  form.value.idCliente = 0;
  clienteSearch.value = "";
};

const seleccionarFiltroCliente = (cliente: Cliente) => {
  filtroClienteId.value = cliente.id;
  filtroClienteSearch.value = `${cliente.nombreCompleto} - Doc ${cliente.nroDocumento || "-"}`;
  filtroClienteOpen.value = false;
  page.value = 1;
};

const limpiarFiltroCliente = () => {
  filtroClienteId.value = 0;
  filtroClienteSearch.value = "";
  filtroClienteOpen.value = false;
  page.value = 1;
};

const seleccionarVendedor = (vendedor: Vendedor) => {
  form.value.idVendedor = vendedor.id;
  vendedorSearch.value = `${vendedor.nombre} ${vendedor.apellido}`.trim();
  vendedorOpen.value = false;
};

const limpiarVendedor = () => {
  form.value.idVendedor = 0;
  vendedorSearch.value = "";
};

const obtenerPrecioBaseProducto = (idProducto: number) => {
  const producto = productosStore.productos.find(x => Number(x.id) === Number(idProducto)) as (Producto & { precio?: number }) | undefined;
  return Math.max(0, Math.round(producto?.precioVenta ?? producto?.precio ?? 0));
};

const parseLocalDateTime = (value: string) => parseApiDate(value);

const estaOfertaVigenteParaFecha = (oferta: Oferta, fecha: Date) => {
  if (!oferta.activa) return false;

  const fechaInicio = parseLocalDateTime(oferta.fechaInicio);
  const fechaFin = parseLocalDateTime(oferta.fechaFin);

  if (Number.isNaN(fechaInicio.getTime()) || Number.isNaN(fechaFin.getTime())) return false;

  const referencia = fecha.getTime();
  return fechaInicio.getTime() <= referencia && referencia <= fechaFin.getTime();
};

const calcularPrecioFinalOferta = (oferta: Oferta) => {
  const precioBase = obtenerPrecioBaseProducto(oferta.idProducto);

  if (oferta.tipoDescuento === TipoDescuento.Porcentaje) {
    return Math.max(0, Math.round(precioBase - (precioBase * oferta.valorDescuento) / 100));
  }

  if (oferta.tipoDescuento === TipoDescuento.Fijo) {
    return Math.max(0, Math.round(precioBase - oferta.valorDescuento));
  }

  return Math.max(0, Math.round(oferta.valorDescuento));
};

const obtenerMejorOfertaVigente = (idProducto: number, fecha: Date) => {
  if (idProducto <= 0) return null;

  const candidatas = ofertas.value.filter((oferta) =>
    Number(oferta.idProducto) === Number(idProducto) && estaOfertaVigenteParaFecha(oferta, fecha),
  );

  if (!candidatas.length) return null;

  return candidatas.reduce((mejor, actual) =>
    calcularPrecioFinalOferta(actual) < calcularPrecioFinalOferta(mejor) ? actual : mejor,
  );
};

const actualizarPrecioNuevoDetalleSegunPreferencia = () => {
  const precioOriginal = precioOriginalNuevoDetalle.value;
  const precioOferta = precioOfertaNuevoDetalle.value;

  if (nuevoDetalle.value.idProducto <= 0) {
    nuevoDetalle.value.precioUnitario = 0;
    nuevoDetallePrecioInput.value = "";
    return;
  }

  const precioFinal = usarPrecioOriginalNuevoDetalle.value || precioOferta == null ? precioOriginal : precioOferta;
  nuevoDetalle.value.precioUnitario = Math.max(0, precioFinal);
  nuevoDetallePrecioInput.value = precioFinal > 0 ? formatoMiles(precioFinal) : "";
};

const togglePrecioOriginalNuevoDetalle = () => {
  actualizarPrecioNuevoDetalleSegunPreferencia();
};

const seleccionarProducto = (producto: Producto) => {
  nuevoDetalle.value.idProducto = producto.id;
  usarPrecioOriginalNuevoDetalle.value = false;
  actualizarPrecioNuevoDetalleSegunPreferencia();
  productoSearch.value = producto.nombre;
  productoOpen.value = false;
};

const limpiarProducto = () => {
  nuevoDetalle.value.idProducto = 0;
  nuevoDetalle.value.precioUnitario = 0;
  nuevoDetallePrecioInput.value = "";
  productoSearch.value = "";
  usarPrecioOriginalNuevoDetalle.value = false;
};

const actualizarNuevoDetallePrecio = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const soloDigitos = target.value.replace(/\D/g, "");
  const valor = soloDigitos ? Number(soloDigitos) : 0;

  nuevoDetalle.value.precioUnitario = valor;
  nuevoDetallePrecioInput.value = soloDigitos ? formatoMiles(valor) : "";
};

const actualizarCobroVentaImporte = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const soloDigitos = target.value.replace(/\D/g, "");
  const valor = soloDigitos ? Number(soloDigitos) : 0;

  cobroVentaForm.value.importe = valor;
  cobroVentaImporteInput.value = soloDigitos ? formatoMiles(valor) : "";
};

const agregarDetalle = () => {
  const { idProducto, cantidad, precioUnitario } = nuevoDetalle.value;
  if (idProducto <= 0) return notification.show("Selecciona un producto", "error");
  if (cantidad <= 0 || !Number.isInteger(cantidad)) return notification.show("La cantidad debe ser un numero entero mayor a 0", "error");
  if (precioUnitario <= 0 || !Number.isInteger(precioUnitario)) return notification.show("El precio unitario debe ser un numero entero mayor a 0", "error");
  if (form.value.detalles.some(d => d.idProducto === idProducto)) return notification.show("Ese producto ya esta agregado en la tabla", "error");

  form.value.detalles.push({
    idProducto,
    cantidad,
    precioUnitario,
    precioOriginal: precioOriginalNuevoDetalle.value,
    precioOferta: precioOfertaNuevoDetalle.value,
    tieneOferta: precioOfertaNuevoDetalle.value != null,
    usarPrecioOriginal: usarPrecioOriginalNuevoDetalle.value,
  });
  nuevoDetalle.value = { idProducto: 0, cantidad: 1, precioUnitario: 0 };
  nuevoDetallePrecioInput.value = "";
  productoSearch.value = "";
  usarPrecioOriginalNuevoDetalle.value = false;
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

const togglePrecioOriginalDetalle = (idx: number) => {
  const item = form.value.detalles[idx];
  if (!item || !item.tieneOferta) return;

  item.precioUnitario = item.usarPrecioOriginal
    ? item.precioOriginal
    : Math.max(1, Math.round(item.precioOferta ?? item.precioOriginal));
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

watch(
  [esConsumidorFinal, totalCalculado],
  ([sinCliente]) => {
    if (!sinCliente) return;
    pagarTodo.value = true;
    form.value.pagos = [{
      idFormaPago: form.value.pagos[0]?.idFormaPago ?? 0,
      importe: totalCalculado.value,
      referencia: "Pago total",
    }];
  },
  { immediate: true },
);

const bloquearDecimal = (event: KeyboardEvent) => {
  if (event.key === "." || event.key === ",") {
    event.preventDefault();
  }
};

const guardarVenta = async () => {
  if (!form.value.numeroComprobante.trim()) return notification.show("El numero de comprobante es obligatorio", "error");
  if (form.value.idVendedor <= 0) return notification.show("Debe seleccionar un vendedor", "error");
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

  if (esConsumidorFinal.value && form.value.pagos.some((p) => p.idFormaPago <= 0)) {
    return notification.show("Debe seleccionar la forma de pago", "error");
  }

  const total = form.value.detalles.reduce((acc, d) => acc + d.cantidad * d.precioUnitario, 0);
  const totalPagado = pagos.reduce((acc, p) => acc + p.importe, 0);
  if (totalPagado > total) {
    return notification.show("Los pagos no pueden superar el total de la venta", "error");
  }
  if (esConsumidorFinal.value && totalPagado !== total) {
    return notification.show("Para Consumidor final debes registrar el pago total de la venta", "error");
  }

  const idVenta = await ventasStore.addVenta({
    numeroComprobante: form.value.numeroComprobante.trim(),
    idCliente: form.value.idCliente,
    idVendedor: form.value.idVendedor,
    idSucursal: form.value.idSucursal,
    observaciones: form.value.observaciones?.trim() || undefined,
    detalles,
    pagos,
  });

  if (!idVenta) return;

  openModal.value = false;
  await Promise.all([buscarVentas(), productosStore.fetchProductos()]);
};

const verDetalle = async (id: number) => {
  ventaDetalle.value = await ventasStore.fetchVentaPorId(id);
  if (!ventaDetalle.value) return;
  openDetalleModal.value = true;
};

const cerrarDetalleModal = () => {
  openDetalleModal.value = false;
  ventaDetalle.value = null;
};

const abrirConfirmacionAnulacion = (id: number) => {
  ventaAAnular.value = id;
  openAnularModal.value = true;
};

const cerrarConfirmacionAnulacion = () => {
  ventaAAnular.value = null;
  openAnularModal.value = false;
};

const confirmarAnulacion = async () => {
  if (!ventaAAnular.value) return;

  const ok = await ventasStore.cancelarVenta(ventaAAnular.value);
  if (!ok) return;
  await Promise.all([buscarVentas(), productosStore.fetchProductos()]);
  cerrarConfirmacionAnulacion();
};

const abrirCobroVenta = (venta: Venta) => {
  ventaCobroSeleccionada.value = venta;
  cobroVentaForm.value = { idFormaPago: 0, importe: 0, referencia: "" };
  cobroVentaImporteInput.value = "";
  openCobroVentaModal.value = true;
};

const cerrarCobroVenta = () => {
  openCobroVentaModal.value = false;
  ventaCobroSeleccionada.value = null;
  cobroVentaForm.value = { idFormaPago: 0, importe: 0, referencia: "" };
  cobroVentaImporteInput.value = "";
};

const usarSaldoPendienteVenta = () => {
  if (!ventaCobroSeleccionada.value) return;
  cobroVentaForm.value.importe = ventaCobroSeleccionada.value.saldoPendiente;
  cobroVentaImporteInput.value = formatoMiles(cobroVentaForm.value.importe);
};

const guardarCobroVenta = async () => {
  if (!ventaCobroSeleccionada.value) return;

  const { idFormaPago, importe, referencia } = cobroVentaForm.value;
  if (ventaCobroSeleccionada.value.saldoPendiente <= 0) {
    return notification.show("La venta no tiene saldo pendiente para cobrar", "error");
  }
  if (idFormaPago <= 0) return notification.show("Debe seleccionar una forma de pago", "error");
  if (importe <= 0) return notification.show("El importe debe ser mayor a 0", "error");
  if (importe > ventaCobroSeleccionada.value.saldoPendiente) {
    return notification.show("El importe no puede superar el saldo pendiente", "error");
  }

  const ok = await ventasStore.registrarCobro({
    idCliente: ventaCobroSeleccionada.value.idCliente,
    importe,
    idFormaPago,
    referencia: referencia?.trim() || "",
  });

  if (!ok) return;

  const idVenta = ventaCobroSeleccionada.value.id;
  await buscarVentas();
  ventaCobroSeleccionada.value = await ventasStore.fetchVentaPorId(idVenta);
  cobroVentaForm.value = { idFormaPago: 0, importe: 0, referencia: "" };
  cobroVentaImporteInput.value = "";

  if (!ventaCobroSeleccionada.value || ventaCobroSeleccionada.value.saldoPendiente <= 0) {
    cerrarCobroVenta();
  }
};

const estaAnulada = (estado: string | number) => {
  const normalizado = String(estado ?? "").trim().toLowerCase();
  return normalizado === "2" || normalizado === "anulada";
};

const nombreCliente = (idCliente: number) => {
  if (Number(idCliente) <= 0) return "Consumidor final";
  const cliente = clientesStore.clientes.find(x => x.id === idCliente);
  return cliente?.nombreCompleto || `Cliente #${idCliente}`;
};

const nombreFormaPago = (idFormaPago: number) => {
  const forma = formasDePagoStore.formasDePago.find(x => x.id === idFormaPago);
  return forma?.nombre || `Forma #${idFormaPago}`;
};

const nombreProducto = (idProducto: number) => {
  const producto = productosStore.productos.find(x => x.id === idProducto);
  return producto?.nombre || `Producto #${idProducto}`;
};

const nombreMarcaProducto = (producto: Producto & { marcaNombre?: string; idMarca?: number }) => {
  if (producto?.marca?.trim()) return producto.marca.trim();
  if (producto?.marcaNombre?.trim()) return producto.marcaNombre.trim();

  const idMarca = Number(producto?.idMarca ?? 0);
  if (idMarca > 0) {
    return marcasStore.marcas.find(x => x.id === idMarca)?.nombre || "-";
  }

  return "-";
};

const marcaProducto = (idProducto: number) => {
  const producto = productosStore.productos.find(x => Number(x.id) === Number(idProducto)) as (Producto & { marcaNombre?: string; idMarca?: number }) | undefined;
  return producto ? nombreMarcaProducto(producto) : "-";
};

const stockProducto = (idProducto: number) => {
  const producto = productosStore.productos.find(x => Number(x.id) === Number(idProducto)) as (Producto & { stock?: number }) | undefined;
  return producto?.stockActual ?? producto?.stock ?? "-";
};

const precioVentaProducto = (idProducto: number) => {
  const producto = productosStore.productos.find(x => Number(x.id) === Number(idProducto)) as (Producto & { precio?: number }) | undefined;
  return money(producto?.precioVenta ?? producto?.precio ?? 0);
};

const descripcionOferta = (oferta: Oferta | null) => {
  if (!oferta) return "";
  if (oferta.tipoDescuento === TipoDescuento.Porcentaje) return `${oferta.valorDescuento}%`;
  return money(oferta.valorDescuento);
};

const cargarOfertas = async () => {
  try {
    ofertas.value = await obtenerOfertas(true);
  } catch (err: any) {
    ofertas.value = [];
    notification.show(err.response?.data?.error || "No se pudieron cargar las ofertas", "error");
  }
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
  if (clienteBox.value && !clienteBox.value.contains(target)) clienteOpen.value = false;
  if (vendedorBox.value && !vendedorBox.value.contains(target)) vendedorOpen.value = false;
  if (productoBox.value && !productoBox.value.contains(target)) productoOpen.value = false;
  if (filtroClienteBox.value && !filtroClienteBox.value.contains(target)) filtroClienteOpen.value = false;
};

onMounted(async () => {
  document.addEventListener("click", handleClickOutside);
  await Promise.all([
    clientesStore.fetchClientes(),
    vendedoresStore.fetchVendedores(),
    marcasStore.fetchMarcas(),
    cargarOfertas(),
    productosStore.fetchProductos(),
    formasDePagoStore.fetchFormasDePago(),
    buscarVentas(),
  ]);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
