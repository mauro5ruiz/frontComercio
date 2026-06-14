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
          <td class="p-2">
            <div class="flex items-center justify-end gap-2">
              <button
                @click="abrirResumenCuentaCorriente(proveedor)"
                class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-cyan-600 transition hover:bg-cyan-50"
                title="Ver cuenta corriente"
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
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 4h11l3 3v13H5z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 4v4h4" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h8" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 16h5" />
                </svg>
              </button>

              <button
                @click="abrirPagoProveedor(proveedor)"
                class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-emerald-600 transition hover:bg-emerald-50"
                title="Pagar proveedor"
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
                @click="abrirEdicion(proveedor)"
                class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-blue-500 transition hover:bg-blue-50"
                title="Editar proveedor"
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
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 20h9" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
                </svg>
              </button>

              <button
                v-if="proveedor.activo"
                @click="desactivar(proveedor.id)"
                class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-yellow-500 transition hover:bg-yellow-50"
                title="Desactivar"
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
                  <circle cx="12" cy="12" r="9" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 16 16 8" />
                </svg>
              </button>

              <button
                v-else
                @click="activar(proveedor.id)"
                class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-green-500 transition hover:bg-green-50"
                title="Activar"
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
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20 6 9 17l-5-5" />
                </svg>
              </button>

              <button
                @click="abrirConfirmacion(proveedor.id)"
                class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-red-500 transition hover:bg-red-50"
                title="Eliminar proveedor"
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
      v-if="openResumenCuentaCorrienteModal && proveedorCuentaCorriente"
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
          <button @click="cerrarResumenCuentaCorriente" class="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300">Cerrar</button>
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

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 mb-4">
          <div class="rounded-lg border bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-wide text-slate-500">Total comprado</div>
            <div class="mt-1 text-2xl font-semibold text-slate-900">{{ money(cuentaCorriente?.totalComprado ?? 0) }}</div>
          </div>
          <div class="rounded-lg border bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-wide text-slate-500">Pagado real</div>
            <div class="mt-1 text-2xl font-semibold text-slate-900">{{ money(cuentaCorriente?.totalPagado ?? 0) }}</div>
            <div v-if="totalCreditoAplicadoCuentaCorriente > 0" class="mt-1 text-xs text-emerald-700">
              + {{ money(totalCreditoAplicadoCuentaCorriente) }} con saldo a favor
            </div>
          </div>
          <div class="rounded-lg border bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-wide text-slate-500">Saldo pendiente</div>
            <div class="mt-1 text-2xl font-semibold text-slate-900">{{ money(cuentaCorriente?.saldoTotalPendiente ?? 0) }}</div>
          </div>
          <div class="rounded-lg border bg-emerald-50 px-4 py-3">
            <div class="text-xs uppercase tracking-wide text-emerald-700">Credito disponible</div>
            <div class="mt-1 text-2xl font-semibold text-emerald-800">{{ money(cuentaCorriente?.creditoDisponible ?? 0) }}</div>
          </div>
          <div class="rounded-lg border bg-amber-50 px-4 py-3">
            <div class="text-xs uppercase tracking-wide" :class="claseTituloEstadoCuenta">{{ tituloEstadoCuenta }}</div>
            <div class="mt-1 text-2xl font-semibold" :class="claseImporteEstadoCuenta">
              {{ money(importeEstadoCuenta) }}
            </div>
          </div>
        </div>

        <div class="rounded-lg border mb-4 overflow-hidden">
          <div class="border-b bg-gray-50 px-4 py-3">
            <h3 class="font-semibold text-gray-800">Compras del proveedor</h3>
            <p class="text-xs text-gray-500">Vista simple de compras con total, pago real, saldo a favor aplicado y saldo pendiente.</p>
          </div>
          <div v-if="comprasCuentaCorriente.length" class="overflow-x-auto">
            <table class="w-full min-w-[860px]">
              <thead class="bg-white text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th class="px-4 py-3">Fecha</th>
                  <th class="px-4 py-3">Comprobante</th>
                  <th class="px-4 py-3 text-right">Total</th>
                  <th class="px-4 py-3 text-right">Pagado real</th>
                  <th class="px-4 py-3 text-right">Saldo a favor aplicado</th>
                  <th class="px-4 py-3 text-right">Pendiente</th>
                  <th class="px-4 py-3 text-right">Accion</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr v-for="compra in comprasCuentaCorrientePaginadas" :key="compra.idCompra" class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-gray-700">{{ formatDate(compra.fecha) }}</td>
                  <td class="px-4 py-3">
                    <div class="font-medium text-gray-800">{{ compra.comprobante }}</div>
                  </td>
                  <td class="px-4 py-3 text-sm text-right text-gray-700">{{ money(compra.total) }}</td>
                  <td class="px-4 py-3 text-sm text-right text-emerald-700">{{ money(compra.pagado) }}</td>
                  <td class="px-4 py-3 text-sm text-right text-sky-700">{{ money(compra.creditoAplicado) }}</td>
                  <td class="px-4 py-3 text-sm text-right font-semibold text-amber-700">{{ money(compra.saldoPendiente) }}</td>
                  <td class="px-4 py-3 text-right">
                    <button
                      type="button"
                      class="cursor-pointer rounded-md border px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50"
                      @click="verDetalleCompraCuentaCorriente(compra.idCompra)"
                    >
                      Ver mas
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="comprasCuentaCorriente.length" class="flex items-center justify-between border-t bg-white px-4 py-3">
            <span class="text-sm text-gray-500">Pagina {{ cuentaCorrientePage }} de {{ totalPaginasCuentaCorriente }}</span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="rounded-md border px-3 py-1.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="cuentaCorrientePage === 1"
                @click="cuentaCorrientePage--"
              >
                Anterior
              </button>
              <button
                type="button"
                class="rounded-md border px-3 py-1.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="cuentaCorrientePage === totalPaginasCuentaCorriente"
                @click="cuentaCorrientePage++"
              >
                Siguiente
              </button>
            </div>
          </div>
          <div v-else class="px-4 py-6 text-sm text-gray-400">
            No hay compras para este proveedor en el rango seleccionado.
          </div>
        </div>

        <div class="rounded-lg border overflow-hidden">
          <div class="border-b bg-gray-50 px-4 py-3">
            <h3 class="font-semibold text-gray-800">Movimientos</h3>
            <p class="text-xs text-gray-500">Incluye compras, pagos y creditos a favor generados por devoluciones o anulaciones.</p>
          </div>
          <div v-if="movimientosCuentaCorriente.length" class="overflow-x-auto">
            <table class="w-full min-w-[920px]">
              <thead class="bg-white text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th class="px-4 py-3">Fecha</th>
                  <th class="px-4 py-3">Tipo</th>
                  <th class="px-4 py-3">Comprobante</th>
                  <th class="px-4 py-3">Forma de pago</th>
                  <th class="px-4 py-3">Referencia</th>
                  <th class="px-4 py-3 text-right">Importe</th>
                  <th class="px-4 py-3 text-right">Saldo credito</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr v-for="(movimiento, index) in movimientosCuentaCorriente" :key="`${movimiento.tipo}-${movimiento.idCompra ?? 'na'}-${movimiento.idPago ?? movimiento.idDevolucionCompra ?? index}`" class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-gray-700">{{ formatDate(movimiento.fecha) }}</td>
                  <td class="px-4 py-3 text-sm">
                    <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold" :class="badgeMovimiento(movimiento.tipo)">
                      {{ movimiento.tipo }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-800">{{ movimiento.comprobante || "-" }}</td>
                  <td class="px-4 py-3 text-sm text-gray-700">{{ movimiento.formaPago || "-" }}</td>
                  <td class="px-4 py-3 text-sm text-gray-700">{{ movimiento.referencia || "-" }}</td>
                  <td class="px-4 py-3 text-sm text-right" :class="colorImporteMovimiento(movimiento.tipo)">
                    {{ money(movimiento.importe) }}
                  </td>
                  <td class="px-4 py-3 text-sm text-right text-emerald-700">
                    {{ movimiento.saldoCredito != null ? money(movimiento.saldoCredito) : "-" }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="px-4 py-6 text-sm text-gray-400">
            No hay movimientos para este proveedor en el rango seleccionado.
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="openPagoProveedorModal && proveedorCuentaCorriente"
      class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 class="text-lg font-bold text-gray-800">Pagar proveedor</h2>
            <p class="text-sm text-gray-500">
              {{ proveedorCuentaCorriente.razonSocial }} - {{ proveedorCuentaCorriente.cuit }}
            </p>
          </div>
          <button @click="cerrarPagoProveedor" class="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300">Cerrar</button>
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

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
          <div class="rounded-lg border bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-wide text-slate-500">Saldo pendiente</div>
            <div class="mt-1 text-2xl font-semibold text-slate-900">{{ money(saldoProveedorSeleccionado) }}</div>
          </div>
          <div class="rounded-lg border bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-wide text-slate-500">Total pagado</div>
            <div class="mt-1 text-2xl font-semibold text-slate-900">{{ money(cuentaCorriente?.totalPagado ?? 0) }}</div>
          </div>
          <div class="rounded-lg border bg-emerald-50 px-4 py-3">
            <div class="text-xs uppercase tracking-wide text-emerald-700">Credito disponible</div>
            <div class="mt-1 text-2xl font-semibold text-emerald-800">{{ money(cuentaCorriente?.creditoDisponible ?? 0) }}</div>
          </div>
          <div class="rounded-lg border bg-amber-50 px-4 py-3">
            <div class="text-xs uppercase tracking-wide" :class="claseTituloEstadoCuenta">{{ tituloEstadoCuenta }}</div>
            <div class="mt-1 text-2xl font-semibold" :class="claseImporteEstadoCuenta">
              {{ money(importeEstadoCuenta) }}
            </div>
          </div>
        </div>

        <div class="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" v-if="(cuentaCorriente?.creditoDisponible ?? 0) > 0">
          El proveedor tiene saldo a favor. Ese credito se descuenta del saldo pendiente y reduce el importe maximo a pagar.
        </div>

        <div class="rounded-lg border mb-4 overflow-hidden">
          <div class="border-b bg-gray-50 px-4 py-3">
            <h3 class="font-semibold text-gray-800">Compras pendientes</h3>
            <p class="text-xs text-gray-500">Resumen simple para ver cuanto se compro, cuanto se pago y cuanto queda pendiente.</p>
          </div>
          <div v-if="comprasPendientesProveedor.length" class="overflow-x-auto">
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
                <tr v-for="compra in comprasPendientesProveedor" :key="compra.idCompra" class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-gray-700">{{ formatDate(compra.fecha) }}</td>
                  <td class="px-4 py-3 text-sm font-medium text-gray-800">{{ compra.comprobante }}</td>
                  <td class="px-4 py-3 text-sm text-right text-gray-700">{{ money(compra.total) }}</td>
                  <td class="px-4 py-3 text-sm text-right text-emerald-700">{{ money(compra.pagado) }}</td>
                  <td class="px-4 py-3 text-sm text-right font-semibold text-amber-700">{{ money(compra.saldoPendiente) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="px-4 py-6 text-sm text-gray-400">
            No hay compras pendientes para este proveedor en el rango seleccionado.
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
                  v-if="saldoNetoProveedor > 0"
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
                <button
                @click="guardarPagoCuentaCorriente"
                :disabled="saldoNetoProveedor <= 0"
                class="w-full bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                Registrar pago
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="openDetalleCompraModal && compraDetalleCuentaCorriente"
      @click.self="cerrarDetalleCompraCuentaCorriente"
      class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 class="text-lg font-bold text-gray-800">Detalle de compra</h2>
            <p class="text-sm text-gray-500">
              {{ compraDetalleCuentaCorriente.numeroComprobante }} - {{ formatDate(compraDetalleCuentaCorriente.fecha) }}
            </p>
          </div>
          <button @click="cerrarDetalleCompraCuentaCorriente" class="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300">Cerrar</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
          <div class="rounded-lg border bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-wide text-slate-500">Total</div>
            <div class="mt-1 text-xl font-semibold text-slate-900">{{ money(compraDetalleCuentaCorriente.total) }}</div>
          </div>
          <div class="rounded-lg border bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-wide text-slate-500">Pagado real</div>
            <div class="mt-1 text-xl font-semibold text-emerald-700">{{ money(compraDetalleCuentaCorriente.totalPagado) }}</div>
          </div>
          <div v-if="Number(compraDetalleCuentaCorriente.creditoAplicado) > 0" class="rounded-lg border bg-sky-50 px-4 py-3">
            <div class="text-xs uppercase tracking-wide text-sky-700">Saldo a favor aplicado</div>
            <div class="mt-1 text-xl font-semibold text-sky-800">{{ money(compraDetalleCuentaCorriente.creditoAplicado || 0) }}</div>
          </div>
          <div class="rounded-lg border bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-wide text-slate-500">Pendiente</div>
            <div class="mt-1 text-xl font-semibold text-amber-700">{{ money(compraDetalleCuentaCorriente.saldoPendiente) }}</div>
          </div>
        </div>

        <div class="rounded-lg border mb-4 overflow-hidden">
          <div class="border-b bg-gray-50 px-4 py-3">
            <h3 class="font-semibold text-gray-800">Productos</h3>
          </div>
          <div v-if="(compraDetalleCuentaCorriente.detalles || []).length" class="overflow-x-auto">
            <table class="w-full min-w-[640px]">
              <thead class="bg-white text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th class="px-4 py-3">Producto</th>
                  <th class="px-4 py-3 text-right">Cantidad</th>
                  <th class="px-4 py-3 text-right">Precio unitario</th>
                  <th class="px-4 py-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr v-for="(detalle, index) in compraDetalleCuentaCorriente.detalles || []" :key="detalle.id ?? `${detalle.idProducto}-${index}`">
                  <td class="px-4 py-3 text-sm text-gray-700">{{ nombreProducto(detalle.idProducto) }}</td>
                  <td class="px-4 py-3 text-sm text-right text-gray-700">{{ detalle.cantidad }}</td>
                  <td class="px-4 py-3 text-sm text-right text-gray-700">{{ money(detalle.precioUnitario) }}</td>
                  <td class="px-4 py-3 text-sm text-right text-gray-700">{{ money(detalle.subtotal || detalle.cantidad * detalle.precioUnitario) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="px-4 py-6 text-sm text-gray-400">Esta compra no tiene productos cargados.</div>
        </div>

        <div class="rounded-lg border overflow-hidden">
          <div class="border-b bg-gray-50 px-4 py-3">
            <h3 class="font-semibold text-gray-800">Pagos</h3>
          </div>
          <div v-if="(compraDetalleCuentaCorriente.pagos || []).length" class="overflow-x-auto">
            <table class="w-full min-w-[640px]">
              <thead class="bg-white text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th class="px-4 py-3">Fecha</th>
                  <th class="px-4 py-3">Forma de pago</th>
                  <th class="px-4 py-3">Referencia</th>
                  <th class="px-4 py-3 text-right">Importe</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr v-for="(pago, index) in compraDetalleCuentaCorriente.pagos || []" :key="pago.id ?? `${pago.idFormaPago}-${index}`">
                  <td class="px-4 py-3 text-sm text-gray-700">{{ pago.fechaPago ? formatDate(pago.fechaPago) : "-" }}</td>
                  <td class="px-4 py-3 text-sm text-gray-700">{{ nombreFormaPago(pago.idFormaPago) }}</td>
                  <td class="px-4 py-3 text-sm text-gray-700">{{ pago.referencia || "-" }}</td>
                  <td class="px-4 py-3 text-sm text-right text-emerald-700">{{ money(pago.importe) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="px-4 py-6 text-sm text-gray-400">No hay pagos registrados para esta compra.</div>
        </div>
        <div v-if="Number(compraDetalleCuentaCorriente.creditoAplicado) > 0" class="mt-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          Esta compra tambien se cancelo con {{ money(compraDetalleCuentaCorriente.creditoAplicado || 0) }} de saldo a favor del proveedor.
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
import { useProductosStore } from "@/modules/productos/store";
import { proveedorSchema } from "@/modules/proveedores/schema";
import { useProveedoresStore } from "@/modules/proveedores/store";
import type { Proveedor } from "@/modules/proveedores/types";
import { useNotificationStore } from "@/stores/notificaciones";

const baseURL = import.meta.env.VITE_FILES_URL;
const store = useProveedoresStore();
const formasDePagoStore = useFormasDePagoStore();
const productosStore = useProductosStore();
const notification = useNotificationStore();
const comprasStore = useComprasStore();

const search = ref("");
const openModal = ref(false);
const openDeleteModal = ref(false);
const openResumenCuentaCorrienteModal = ref(false);
const openPagoProveedorModal = ref(false);
const openDetalleCompraModal = ref(false);
const incluirEliminados = ref(false);
const proveedorCuentaCorriente = ref<Proveedor | null>(null);
const compraDetalleCuentaCorriente = ref<Compra | null>(null);

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
const cuentaCorrientePage = ref(1);
const cuentaCorrientePageSize = 5;
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
  productosStore.fetchProductos();
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
const productos = computed(() => productosStore.productos);
const cuentaCorriente = computed(() => store.cuentaCorriente);
const comprasPendientesProveedor = computed(() => cuentaCorriente.value?.comprasPendientes ?? []);
const saldoProveedorSeleccionado = computed(() => cuentaCorriente.value?.saldoTotalPendiente ?? 0);
const saldoNetoProveedor = computed(() => cuentaCorriente.value?.saldoNeto ?? saldoProveedorSeleccionado.value);
const importeEstadoCuenta = computed(() => Math.abs(saldoNetoProveedor.value));
const tituloEstadoCuenta = computed(() => {
  if (saldoNetoProveedor.value > 0) return "Saldo neto a pagar";
  if (saldoNetoProveedor.value < 0) return "Saldo a favor";
  return "Sin deuda";
});
const claseTituloEstadoCuenta = computed(() => {
  if (saldoNetoProveedor.value > 0) return "text-amber-700";
  if (saldoNetoProveedor.value < 0) return "text-emerald-700";
  return "text-slate-500";
});
const claseImporteEstadoCuenta = computed(() => {
  if (saldoNetoProveedor.value > 0) return "text-amber-800";
  if (saldoNetoProveedor.value < 0) return "text-emerald-800";
  return "text-slate-900";
});
const movimientosCuentaCorriente = computed(() => cuentaCorriente.value?.movimientos ?? []);
const comprasCuentaCorriente = computed(() =>
  (cuentaCorriente.value?.movimientos ?? [])
    .filter((movimiento) => movimiento.tipo.toLowerCase() === "compra")
    .map((movimiento) => ({
      idCompra: movimiento.idCompra ?? 0,
      fecha: movimiento.fecha,
      comprobante: movimiento.comprobante,
      total: movimiento.totalCompra ?? movimiento.importe ?? 0,
      pagado: movimiento.pagadoCompra ?? 0,
      creditoAplicado: Math.max(
        0,
        (movimiento.totalCompra ?? movimiento.importe ?? 0)
          - (movimiento.pagadoCompra ?? 0)
          - (movimiento.saldoPendienteCompra ?? 0),
      ),
      saldoPendiente: movimiento.saldoPendienteCompra ?? 0
    }))
    .filter((compra) => compra.idCompra > 0)
);
const totalCreditoAplicadoCuentaCorriente = computed(() =>
  comprasCuentaCorriente.value.reduce((acc, compra) => acc + compra.creditoAplicado, 0),
);
const totalPaginasCuentaCorriente = computed(() =>
  Math.max(1, Math.ceil(comprasCuentaCorriente.value.length / cuentaCorrientePageSize))
);
const comprasCuentaCorrientePaginadas = computed(() => {
  const start = (cuentaCorrientePage.value - 1) * cuentaCorrientePageSize;
  return comprasCuentaCorriente.value.slice(start, start + cuentaCorrientePageSize);
});

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

function toLocalInputDate(date: Date) {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
}

function parseApiDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parts = value.split("-").map(Number);
    const year = parts[0] ?? 0;
    const month = parts[1] ?? 1;
    const day = parts[2] ?? 1;
    return new Date(year, month - 1, day);
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

function nombreProducto(idProducto: number) {
  return productos.value.find((producto) => producto.id === idProducto)?.nombre || `Producto #${idProducto}`;
}

function nombreFormaPago(idFormaPago: number) {
  return formasDePago.value.find((forma) => forma.id === idFormaPago)?.nombre || `Forma #${idFormaPago}`;
}

function badgeMovimiento(tipo: string) {
  const normalizado = tipo.toLowerCase();
  if (normalizado === "credito") return "bg-emerald-100 text-emerald-800";
  if (normalizado === "pago") return "bg-blue-100 text-blue-800";
  return "bg-slate-100 text-slate-800";
}

function colorImporteMovimiento(tipo: string) {
  const normalizado = tipo.toLowerCase();
  if (normalizado === "credito") return "text-emerald-700";
  if (normalizado === "pago") return "text-blue-700";
  return "text-gray-700";
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
    const fieldErrors = resultado.error.flatten().fieldErrors as Record<string, string[] | undefined>;
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

  cuentaCorrientePage.value = 1;
  await store.fetchCuentaCorriente(
    proveedorCuentaCorriente.value.id,
    cuentaCorrienteDesde.value,
    cuentaCorrienteHasta.value
  );
};

const abrirResumenCuentaCorriente = async (proveedor: Proveedor) => {
  proveedorCuentaCorriente.value = proveedor;
  cuentaCorrientePage.value = 1;
  openResumenCuentaCorrienteModal.value = true;
  await buscarCuentaCorriente();
};

const cerrarResumenCuentaCorriente = () => {
  openResumenCuentaCorrienteModal.value = false;
  proveedorCuentaCorriente.value = null;
  cuentaCorrientePage.value = 1;
};

const abrirPagoProveedor = async (proveedor: Proveedor) => {
  proveedorCuentaCorriente.value = proveedor;
  pagoCuentaCorriente.value = { idFormaPago: 0, importe: 0 };
  openPagoProveedorModal.value = true;
  await buscarCuentaCorriente();
};

const cerrarPagoProveedor = () => {
  openPagoProveedorModal.value = false;
  proveedorCuentaCorriente.value = null;
  pagoCuentaCorriente.value = { idFormaPago: 0, importe: 0 };
};

const verDetalleCompraCuentaCorriente = async (idCompra: number) => {
  const compra = await comprasStore.fetchCompraPorId(idCompra);
  if (!compra) return;
  compraDetalleCuentaCorriente.value = compra;
  openDetalleCompraModal.value = true;
};

const cerrarDetalleCompraCuentaCorriente = () => {
  openDetalleCompraModal.value = false;
  compraDetalleCuentaCorriente.value = null;
};

const usarSaldoPendienteProveedor = () => {
  pagoCuentaCorriente.value.importe = Math.max(saldoNetoProveedor.value, 0);
};

const guardarPagoCuentaCorriente = async () => {
  if (!proveedorCuentaCorriente.value) return;

  const { idFormaPago, importe } = pagoCuentaCorriente.value;
  if (saldoNetoProveedor.value <= 0) {
    return notification.show("El proveedor no tiene saldo neto pendiente para pagar", "error");
  }
  if (idFormaPago <= 0) return notification.show("Debe seleccionar una forma de pago", "error");
  if (importe <= 0) return notification.show("El importe debe ser mayor a 0", "error");
  if (importe > saldoNetoProveedor.value) {
    return notification.show("El importe no puede superar el saldo neto pendiente", "error");
  }

  const ok = await store.registrarPagoProveedor({
    idProveedor: proveedorCuentaCorriente.value.id,
    importe,
    idFormaPago
  });

  if (!ok) return;

  pagoCuentaCorriente.value = { idFormaPago: 0, importe: 0 };
  await buscarCuentaCorriente();
};
</script>
