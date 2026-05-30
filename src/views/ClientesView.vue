<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Clientes</h1>

    <div class="flex justify-end mb-4">
      <button
        @click="abrirCrear"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        + Nuevo cliente
      </button>
    </div>

    <div class="flex items-center gap-2 mb-4">
      <input id="chkClientesEliminados" v-model="incluirEliminados" type="checkbox" />
      <label for="chkClientesEliminados" class="cursor-pointer">Incluir inactivos</label>
    </div>

    <input
      v-model="search"
      placeholder="Buscar cliente..."
      class="w-full border px-3 py-2 rounded mb-4"
    />

    <table class="w-full bg-white rounded shadow">
      <thead>
        <tr class="border-b text-left">
          <th class="p-2">Imagen</th>
          <th class="p-2">Nombre</th>
          <th class="p-2">Documento</th>
          <th class="p-2">CUIT</th>
          <th class="p-2">Telefono</th>
          <th class="p-2">Activo</th>
          <th class="p-2 text-right">Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="cliente in clientesPaginados"
          :key="cliente.id"
          class="border-b hover:bg-gray-50"
        >
          <td class="p-2 w-20 h-16">
            <div class="w-full h-full flex items-center justify-center">
              <img
                v-if="getImageUrl(cliente.urlImagen)"
                :src="getImageUrl(cliente.urlImagen) || undefined"
                class="max-w-full max-h-full object-contain"
              />
              <span v-else class="text-gray-400 text-xs">Sin imagen</span>
            </div>
          </td>
          <td class="p-2">{{ cliente.nombreCompleto }}</td>
          <td class="p-2">{{ cliente.nroDocumento || "-" }}</td>
          <td class="p-2">{{ cliente.cuit || "-" }}</td>
          <td class="p-2">{{ cliente.nroTelefono || "-" }}</td>
          <td class="p-2">
            <span :class="cliente.activo ? 'text-green-600' : 'text-red-500'">
              {{ cliente.activo ? "Si" : "No" }}
            </span>
          </td>
          <td class="p-2">
            <div class="flex items-center justify-end gap-2">
              <button
                @click="abrirResumenCuentaCorriente(cliente)"
                class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-cyan-600 transition hover:bg-cyan-50"
                title="Ver cuenta corriente"
                type="button"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 4h11l3 3v13H5z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 4v4h4" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h8" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 16h5" />
                </svg>
              </button>

              <button
                @click="abrirCobroCliente(cliente)"
                class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-emerald-600 transition hover:bg-emerald-50"
                title="Cobrar cliente"
                type="button"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v18" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 7.5c0-1.9-2-3.5-4.5-3.5S7.5 5.6 7.5 7.5 9.5 11 12 11s4.5 1.6 4.5 3.5S14.5 18 12 18s-4.5-1.6-4.5-3.5" />
                </svg>
              </button>

              <button
                @click="abrirEdicion(cliente)"
                class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-blue-500 transition hover:bg-blue-50"
                title="Editar cliente"
                type="button"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 20h9" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
                </svg>
              </button>

              <button
                v-if="cliente.activo"
                @click="darDeBaja(cliente.id)"
                class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-yellow-500 transition hover:bg-yellow-50"
                title="Desactivar"
                type="button"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 16 16 8" />
                </svg>
              </button>

              <button
                v-else
                @click="restaurar(cliente.id)"
                class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-green-500 transition hover:bg-green-50"
                title="Activar"
                type="button"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20 6 9 17l-5-5" />
                </svg>
              </button>

              <button
                @click="abrirConfirmacion(cliente.id)"
                class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-red-500 transition hover:bg-red-50"
                title="Eliminar cliente"
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

        <tr v-if="clientesFiltrados.length === 0">
          <td colspan="7" class="text-center py-4 text-gray-400">No hay clientes</td>
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
            {{ modoEdicion ? "Editar cliente" : "Nuevo cliente" }}
          </h2>
        </div>

        <div class="p-6 overflow-y-auto space-y-5">
          <div>
            <div class="flex items-center gap-3">
              <label class="w-40 text-sm font-medium text-gray-700">Tipo cliente *</label>
              <select
                v-model="tipoCliente"
                class="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              >
                <option :value="1">Persona</option>
                <option :value="2">Empresa</option>
              </select>
            </div>
          </div>

          <div v-if="tipoCliente === 1" class="space-y-3">
            <div class="flex items-center gap-3">
              <label class="w-40 text-sm font-medium text-gray-700">Nombre</label>
              <input v-model="nombre" class="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
            </div>

            <div class="flex items-center gap-3">
              <label class="w-40 text-sm font-medium text-gray-700">Apellido</label>
              <input v-model="apellido" class="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
            </div>
          </div>

          <div v-if="tipoCliente === 2" class="space-y-3">
            <div class="flex items-center gap-3">
              <label class="w-40 text-sm font-medium text-gray-700">Razon social *</label>
              <input v-model="razonSocial" class="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
            </div>

            <div class="flex items-center gap-3">
              <label class="w-40 text-sm font-medium text-gray-700">CUIT *</label>
              <input v-model="cuit" class="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
            </div>
          </div>

          <div>
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Contacto</h3>

            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <label class="w-40 text-sm font-medium text-gray-700">Documento</label>
                <input v-model="nroDocumento" class="flex-1 border border-gray-300 px-3 py-2 rounded-md" />
              </div>

              <div class="flex items-center gap-3">
                <label class="w-40 text-sm font-medium text-gray-700">Telefono</label>
                <input v-model="nroTelefono" class="flex-1 border border-gray-300 px-3 py-2 rounded-md" />
              </div>

              <div class="flex items-center gap-3">
                <label class="w-40 text-sm font-medium text-gray-700">Email</label>
                <input v-model="email" class="flex-1 border border-gray-300 px-3 py-2 rounded-md" />
              </div>

              <div class="flex items-center gap-3">
                <label class="w-40 text-sm font-medium text-gray-700">Cond. IVA</label>
                <input v-model="condicionIva" class="flex-1 border border-gray-300 px-3 py-2 rounded-md" />
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Direccion</h3>

            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <label class="w-40 text-sm font-medium text-gray-700">Direccion</label>
                <input v-model="direccion" class="flex-1 border border-gray-300 px-3 py-2 rounded-md" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="flex items-center gap-3">
                  <label class="w-20 text-sm font-medium text-gray-700">Localidad</label>
                  <input v-model="localidad" class="flex-1 border border-gray-300 px-3 py-2 rounded-md" />
                </div>

                <div class="flex items-center gap-3">
                  <label class="w-20 text-sm font-medium text-gray-700">Provincia</label>
                  <input v-model="provincia" class="flex-1 border border-gray-300 px-3 py-2 rounded-md" />
                </div>
              </div>

              <div class="flex items-center gap-3">
                <label class="w-40 text-sm font-medium text-gray-700">Codigo postal</label>
                <input v-model="codigoPostal" class="flex-1 border border-gray-300 px-3 py-2 rounded-md" />
              </div>
            </div>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-700 mb-1 block">Observaciones</label>
            <textarea
              v-model="observaciones"
              rows="3"
              class="w-full border border-gray-300 px-3 py-2 rounded-md"
            ></textarea>
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

          <div class="flex items-center gap-2 border-t pt-4">
            <input id="chkClienteActivo" v-model="activo" type="checkbox" />
            <label for="chkClienteActivo" class="text-sm text-gray-700">Activo</label>
          </div>
        </div>

        <div class="px-6 py-4 border-t bg-gray-50 rounded-b-xl flex justify-end gap-2">
          <button @click="cerrarModal" class="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">
            Cancelar
          </button>
          <button @click="guardar" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
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
          Estas seguro que queres eliminar permanentemente este cliente?
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
      v-if="openResumenCuentaCorrienteModal && clienteCuentaCorriente"
      class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 class="text-lg font-bold text-gray-800">Cuenta corriente del cliente</h2>
            <p class="text-sm text-gray-500">{{ descripcionCliente(clienteCuentaCorriente) }}</p>
          </div>
          <button @click="cerrarResumenCuentaCorriente" class="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300">
            Cerrar
          </button>
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
            <div class="text-xs uppercase tracking-wide text-slate-500">Total vendido</div>
            <div class="mt-1 text-2xl font-semibold text-slate-900">{{ money(cuentaCorriente?.totalVendido ?? 0) }}</div>
          </div>
          <div class="rounded-lg border bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-wide text-slate-500">Total cobrado</div>
            <div class="mt-1 text-2xl font-semibold text-slate-900">{{ money(cuentaCorriente?.totalCobrado ?? 0) }}</div>
          </div>
          <div class="rounded-lg border bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-wide text-slate-500">Saldo pendiente</div>
            <div class="mt-1 text-2xl font-semibold text-slate-900">{{ money(cuentaCorriente?.saldoTotalPendiente ?? 0) }}</div>
          </div>
          <div class="rounded-lg border bg-emerald-50 px-4 py-3">
            <div class="text-xs uppercase tracking-wide text-emerald-700">Credito disponible</div>
            <div class="mt-1 text-2xl font-semibold text-emerald-800">{{ money(cuentaCorriente?.creditoDisponible ?? 0) }}</div>
          </div>
          <div class="rounded-lg border px-4 py-3">
            <div class="text-xs uppercase tracking-wide" :class="claseTituloEstadoCuenta">{{ tituloEstadoCuenta }}</div>
            <div class="mt-1 text-2xl font-semibold" :class="claseImporteEstadoCuenta">{{ money(importeEstadoCuenta) }}</div>
          </div>
        </div>

        <div class="rounded-lg border mb-4 overflow-hidden">
          <div class="border-b bg-gray-50 px-4 py-3">
            <h3 class="font-semibold text-gray-800">Ventas del cliente</h3>
            <p class="text-xs text-gray-500">Detalle de ventas dentro del rango seleccionado.</p>
          </div>
          <div v-if="ventasCuentaCorrientePaginadas.length" class="overflow-x-auto">
            <table class="w-full min-w-[780px]">
              <thead class="bg-white text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th class="px-4 py-3">Fecha</th>
                  <th class="px-4 py-3">Comprobante</th>
                  <th class="px-4 py-3 text-right">Total</th>
                  <th class="px-4 py-3 text-right">Cobrado</th>
                  <th class="px-4 py-3 text-right">Pendiente</th>
                  <th class="px-4 py-3 text-right">Accion</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr v-for="venta in ventasCuentaCorrientePaginadas" :key="venta.idVenta" class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-gray-700">{{ formatDate(venta.fecha) }}</td>
                  <td class="px-4 py-3 text-sm text-gray-800">{{ venta.comprobante }}</td>
                  <td class="px-4 py-3 text-sm text-right text-gray-700">{{ money(venta.total) }}</td>
                  <td class="px-4 py-3 text-sm text-right text-emerald-700">{{ money(venta.cobrado) }}</td>
                  <td class="px-4 py-3 text-sm text-right font-semibold text-amber-700">{{ money(venta.saldoPendiente) }}</td>
                  <td class="px-4 py-3 text-right">
                    <button
                      type="button"
                      class="cursor-pointer rounded-md border px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50"
                      @click="verDetalleVentaCuentaCorriente(venta.idVenta)"
                    >
                      Ver mas
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="px-4 py-6 text-sm text-gray-400">
            No hay ventas para este cliente en el rango seleccionado.
          </div>

          <div v-if="ventasCuentaCorriente.length" class="flex items-center justify-between border-t bg-white px-4 py-3">
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
        </div>

        <div class="rounded-lg border overflow-hidden">
          <div class="border-b bg-gray-50 px-4 py-3">
            <h3 class="font-semibold text-gray-800">Movimientos</h3>
            <p class="text-xs text-gray-500">Incluye ventas, cobros y creditos a favor generados por devoluciones o anulaciones.</p>
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
                <tr
                  v-for="(movimiento, index) in movimientosCuentaCorriente"
                  :key="`${movimiento.tipo}-${movimiento.idVenta ?? 'na'}-${movimiento.idCobro ?? movimiento.idDevolucionVenta ?? index}`"
                  class="hover:bg-gray-50"
                >
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
            No hay movimientos para este cliente en el rango seleccionado.
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="openCobroClienteModal && clienteCuentaCorriente"
      class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 class="text-lg font-bold text-gray-800">Cobrar cliente</h2>
            <p class="text-sm text-gray-500">{{ descripcionCliente(clienteCuentaCorriente) }}</p>
          </div>
          <button @click="cerrarCobroCliente" class="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300">Cerrar</button>
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
            <div class="mt-1 text-2xl font-semibold text-slate-900">{{ money(saldoClienteSeleccionado) }}</div>
          </div>
          <div class="rounded-lg border bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-wide text-slate-500">Total cobrado</div>
            <div class="mt-1 text-2xl font-semibold text-slate-900">{{ money(cuentaCorriente?.totalCobrado ?? 0) }}</div>
          </div>
          <div class="rounded-lg border bg-emerald-50 px-4 py-3">
            <div class="text-xs uppercase tracking-wide text-emerald-700">Credito disponible</div>
            <div class="mt-1 text-2xl font-semibold text-emerald-800">{{ money(cuentaCorriente?.creditoDisponible ?? 0) }}</div>
          </div>
          <div class="rounded-lg border px-4 py-3">
            <div class="text-xs uppercase tracking-wide" :class="claseTituloEstadoCuenta">{{ tituloEstadoCuenta }}</div>
            <div class="mt-1 text-2xl font-semibold" :class="claseImporteEstadoCuenta">{{ money(importeEstadoCuenta) }}</div>
          </div>
        </div>

        <div v-if="(cuentaCorriente?.creditoDisponible ?? 0) > 0" class="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          El cliente tiene saldo a favor. Ese credito se descuenta del saldo pendiente y reduce el importe maximo a cobrar.
        </div>

        <div class="rounded-lg border mb-4 overflow-hidden">
          <div class="border-b bg-gray-50 px-4 py-3">
            <h3 class="font-semibold text-gray-800">Ventas pendientes</h3>
            <p class="text-xs text-gray-500">Resumen simple para ver cuanto se vendio, cuanto se cobro y cuanto queda pendiente.</p>
          </div>

          <div v-if="ventasPendientesCliente.length" class="overflow-x-auto">
            <table class="w-full min-w-[720px]">
              <thead class="bg-white text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th class="px-4 py-3">Fecha</th>
                  <th class="px-4 py-3">Comprobante</th>
                  <th class="px-4 py-3 text-right">Total</th>
                  <th class="px-4 py-3 text-right">Cobrado</th>
                  <th class="px-4 py-3 text-right">Pendiente</th>
                  <th class="px-4 py-3 text-right">Accion</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr v-for="venta in ventasPendientesCliente" :key="venta.idVenta" class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-gray-700">{{ formatDate(venta.fecha) }}</td>
                  <td class="px-4 py-3 text-sm text-gray-800">{{ venta.comprobante }}</td>
                  <td class="px-4 py-3 text-sm text-right text-gray-700">{{ money(venta.total) }}</td>
                  <td class="px-4 py-3 text-sm text-right text-emerald-700">{{ money(venta.cobrado) }}</td>
                  <td class="px-4 py-3 text-sm text-right font-semibold text-amber-700">{{ money(venta.saldoPendiente) }}</td>
                  <td class="px-4 py-3 text-right">
                    <button
                      type="button"
                      class="cursor-pointer rounded-md border px-3 py-1.5 text-sm text-emerald-700 transition hover:bg-emerald-50"
                      @click="usarSaldoPendienteCliente(venta.saldoPendiente)"
                    >
                      Usar saldo
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="px-4 py-6 text-sm text-gray-400">
            No hay ventas pendientes para este cliente en el rango seleccionado.
          </div>
        </div>

        <div class="rounded-lg border bg-white px-4 py-4">
          <h3 class="font-semibold text-gray-800 mb-3">Registrar cobro</h3>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="text-sm text-gray-700">Forma de pago *</label>
              <select v-model.number="cobroCuentaCorriente.idFormaPago" class="w-full border px-3 py-2 rounded-md">
                <option :value="0">Seleccionar</option>
                <option v-for="forma in formasDePago" :key="forma.id" :value="forma.id">{{ forma.nombre }}</option>
              </select>
            </div>
            <div>
              <div class="flex items-center justify-between">
                <label class="text-sm text-gray-700">Importe *</label>
                <button
                  v-if="saldoNetoCliente > 0"
                  type="button"
                  class="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                  @click="usarSaldoPendienteCliente()"
                >
                  Usar saldo
                </button>
              </div>
              <input v-model.number="cobroCuentaCorriente.importe" type="number" min="0.01" step="0.01" class="w-full border px-3 py-2 rounded-md" />
            </div>
            <div>
              <label class="text-sm text-gray-700">Referencia</label>
              <input v-model="cobroCuentaCorriente.referencia" maxlength="120" class="w-full border px-3 py-2 rounded-md" />
            </div>
          </div>

          <div class="mt-4 flex justify-end">
            <button
              @click="guardarCobroCuentaCorriente"
              :disabled="saldoNetoCliente <= 0"
              class="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              Registrar cobro
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="openDetalleVentaModal && ventaDetalleCuentaCorriente"
      @click.self="cerrarDetalleVentaCuentaCorriente"
      class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 class="text-lg font-bold text-gray-800">Detalle de venta</h2>
            <p class="text-sm text-gray-500">
              {{ ventaDetalleCuentaCorriente.numeroComprobante }} - {{ formatDate(ventaDetalleCuentaCorriente.fecha) }}
            </p>
          </div>
          <button @click="cerrarDetalleVentaCuentaCorriente" class="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300">
            Cerrar
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div class="rounded-lg border bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-wide text-slate-500">Total</div>
            <div class="mt-1 text-xl font-semibold text-slate-900">{{ money(ventaDetalleCuentaCorriente.total) }}</div>
          </div>
          <div class="rounded-lg border bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-wide text-slate-500">Cobrado</div>
            <div class="mt-1 text-xl font-semibold text-emerald-700">{{ money(ventaDetalleCuentaCorriente.totalPagado) }}</div>
          </div>
          <div class="rounded-lg border bg-slate-50 px-4 py-3">
            <div class="text-xs uppercase tracking-wide text-slate-500">Pendiente</div>
            <div class="mt-1 text-xl font-semibold text-amber-700">{{ money(ventaDetalleCuentaCorriente.saldoPendiente) }}</div>
          </div>
        </div>

        <div class="rounded-lg border mb-4 overflow-hidden">
          <div class="border-b bg-gray-50 px-4 py-3">
            <h3 class="font-semibold text-gray-800">Productos</h3>
          </div>
          <div v-if="(ventaDetalleCuentaCorriente.detalles || []).length" class="overflow-x-auto">
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
                <tr v-for="(detalle, index) in ventaDetalleCuentaCorriente.detalles || []" :key="detalle.id ?? `${detalle.idProducto}-${index}`">
                  <td class="px-4 py-3 text-sm text-gray-700">{{ nombreProducto(detalle.idProducto) }}</td>
                  <td class="px-4 py-3 text-sm text-right text-gray-700">{{ detalle.cantidad }}</td>
                  <td class="px-4 py-3 text-sm text-right text-gray-700">{{ money(detalle.precioUnitario) }}</td>
                  <td class="px-4 py-3 text-sm text-right text-gray-700">{{ money(detalle.subtotal || detalle.cantidad * detalle.precioUnitario) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="px-4 py-6 text-sm text-gray-400">Esta venta no tiene productos cargados.</div>
        </div>

        <div class="rounded-lg border overflow-hidden">
          <div class="border-b bg-gray-50 px-4 py-3">
            <h3 class="font-semibold text-gray-800">Cobros</h3>
          </div>
          <div v-if="(ventaDetalleCuentaCorriente.pagos || []).length" class="overflow-x-auto">
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
                <tr v-for="(pago, index) in ventaDetalleCuentaCorriente.pagos || []" :key="pago.id ?? `${pago.idFormaPago}-${index}`">
                  <td class="px-4 py-3 text-sm text-gray-700">{{ pago.fechaPago ? formatDate(pago.fechaPago) : "-" }}</td>
                  <td class="px-4 py-3 text-sm text-gray-700">{{ nombreFormaPago(pago.idFormaPago) }}</td>
                  <td class="px-4 py-3 text-sm text-gray-700">{{ pago.referencia || "-" }}</td>
                  <td class="px-4 py-3 text-sm text-right text-emerald-700">{{ money(pago.importe) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="px-4 py-6 text-sm text-gray-400">No hay cobros registrados para esta venta.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { clienteSchema } from "@/modules/clientes/schema";
import { useClientesStore } from "@/modules/clientes/store";
import type { Cliente } from "@/modules/clientes/types";
import { useFormasDePagoStore } from "@/modules/formasDePagos/store";
import { useProductosStore } from "@/modules/productos/store";
import { useVentasStore } from "@/modules/ventas/store";
import type { Venta } from "@/modules/ventas/types";
import { useNotificationStore } from "@/stores/notificaciones";

const baseURL = import.meta.env.VITE_FILES_URL;
const notification = useNotificationStore();
const store = useClientesStore();
const formasDePagoStore = useFormasDePagoStore();
const productosStore = useProductosStore();
const ventasStore = useVentasStore();

const search = ref("");
const incluirEliminados = ref(false);

const openModal = ref(false);
const openDeleteModal = ref(false);
const openResumenCuentaCorrienteModal = ref(false);
const openCobroClienteModal = ref(false);
const openDetalleVentaModal = ref(false);
const modoEdicion = ref(false);
const clienteEditando = ref<number | null>(null);
const clienteAEliminar = ref<number | null>(null);
const clienteCuentaCorriente = ref<Cliente | null>(null);
const ventaDetalleCuentaCorriente = ref<Venta | null>(null);

const page = ref(1);
const pageSize = 7;
const cuentaCorrientePage = ref(1);
const cuentaCorrientePageSize = 5;

const hoy = new Date();
const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

const tipoCliente = ref(1);
const nombre = ref("");
const apellido = ref("");
const razonSocial = ref("");
const nroDocumento = ref("");
const cuit = ref("");
const nroTelefono = ref("");
const email = ref("");
const direccion = ref("");
const localidad = ref("");
const provincia = ref("");
const codigoPostal = ref("");
const condicionIva = ref("");
const observaciones = ref("");
const activo = ref(true);

const imagen = ref<File | null>(null);
const preview = ref<string | null>(null);
const eliminarImagen = ref(false);

const cuentaCorrienteDesde = ref(toLocalInputDate(primerDiaMes));
const cuentaCorrienteHasta = ref(toLocalInputDate(hoy));

const cobroCuentaCorriente = ref({
  idFormaPago: 0,
  importe: 0,
  referencia: "",
});

const clientesFiltrados = computed(() =>
  store.clientes.filter((cliente) => {
    const texto = `${cliente.nombreCompleto} ${cliente.nroDocumento || ""} ${cliente.cuit || ""}`.toLowerCase();
    const coincideBusqueda = texto.includes(search.value.toLowerCase());
    const incluir = incluirEliminados.value ? true : cliente.activo;
    return coincideBusqueda && incluir;
  }),
);

const totalPaginas = computed(() => Math.max(1, Math.ceil(clientesFiltrados.value.length / pageSize)));
const clientesPaginados = computed(() => {
  const start = (page.value - 1) * pageSize;
  return clientesFiltrados.value.slice(start, start + pageSize);
});

const cuentaCorriente = computed(() => store.cuentaCorriente);
const formasDePago = computed(() => formasDePagoStore.formasDePago);
const movimientosCuentaCorriente = computed(() => cuentaCorriente.value?.movimientos ?? []);
const ventasPendientesCliente = computed(() => cuentaCorriente.value?.ventasPendientes ?? []);
const ventasCuentaCorriente = computed(() =>
  movimientosCuentaCorriente.value
    .filter((movimiento) => movimiento.tipo.toLowerCase() === "venta")
    .map((movimiento) => ({
      idVenta: movimiento.idVenta ?? 0,
      fecha: movimiento.fecha,
      comprobante: movimiento.comprobante,
      total: movimiento.totalVenta ?? movimiento.importe ?? 0,
      cobrado: movimiento.cobradoVenta ?? 0,
      saldoPendiente: movimiento.saldoPendienteVenta ?? 0,
    }))
    .filter((venta) => venta.idVenta > 0),
);
const totalPaginasCuentaCorriente = computed(() =>
  Math.max(1, Math.ceil(ventasCuentaCorriente.value.length / cuentaCorrientePageSize)),
);
const ventasCuentaCorrientePaginadas = computed(() => {
  const start = (cuentaCorrientePage.value - 1) * cuentaCorrientePageSize;
  return ventasCuentaCorriente.value.slice(start, start + cuentaCorrientePageSize);
});
const saldoClienteSeleccionado = computed(() => cuentaCorriente.value?.saldoTotalPendiente ?? 0);
const saldoNetoCliente = computed(() => cuentaCorriente.value?.saldoNeto ?? saldoClienteSeleccionado.value);
const importeEstadoCuenta = computed(() => Math.abs(saldoNetoCliente.value));
const tituloEstadoCuenta = computed(() => {
  if (saldoNetoCliente.value > 0) return "Saldo neto a cobrar";
  if (saldoNetoCliente.value < 0) return "Saldo a favor";
  return "Sin deuda";
});
const claseTituloEstadoCuenta = computed(() => {
  if (saldoNetoCliente.value > 0) return "text-amber-700";
  if (saldoNetoCliente.value < 0) return "text-emerald-700";
  return "text-slate-500";
});
const claseImporteEstadoCuenta = computed(() => {
  if (saldoNetoCliente.value > 0) return "text-amber-800";
  if (saldoNetoCliente.value < 0) return "text-emerald-800";
  return "text-slate-900";
});

onMounted(() => {
  store.fetchClientes();
  formasDePagoStore.fetchFormasDePago();
  productosStore.fetchProductos();
});

watch(incluirEliminados, (valor) => {
  page.value = 1;
  store.fetchClientes(valor);
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
    minimumFractionDigits: 2,
  }).format(value || 0);
}

function getImageUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${baseURL.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
}

function descripcionCliente(cliente: Cliente) {
  return `${cliente.nombreCompleto}${cliente.cuit ? ` - ${cliente.cuit}` : ""}`;
}

function nombreProducto(idProducto: number) {
  return productosStore.productos.find((producto) => producto.id === idProducto)?.nombre || `Producto #${idProducto}`;
}

function nombreFormaPago(idFormaPago: number) {
  return formasDePago.value.find((forma) => forma.id === idFormaPago)?.nombre || `Forma #${idFormaPago}`;
}

function badgeMovimiento(tipo: string) {
  const normalizado = tipo.toLowerCase();
  if (normalizado === "credito") return "bg-emerald-100 text-emerald-800";
  if (normalizado === "cobro" || normalizado === "pago") return "bg-blue-100 text-blue-800";
  return "bg-slate-100 text-slate-800";
}

function colorImporteMovimiento(tipo: string) {
  const normalizado = tipo.toLowerCase();
  if (normalizado === "credito") return "text-emerald-700";
  if (normalizado === "cobro" || normalizado === "pago") return "text-blue-700";
  return "text-gray-700";
}

const resetForm = () => {
  tipoCliente.value = 1;
  nombre.value = "";
  apellido.value = "";
  razonSocial.value = "";
  nroDocumento.value = "";
  cuit.value = "";
  nroTelefono.value = "";
  email.value = "";
  direccion.value = "";
  localidad.value = "";
  provincia.value = "";
  codigoPostal.value = "";
  condicionIva.value = "";
  observaciones.value = "";
  activo.value = true;
  imagen.value = null;
  preview.value = null;
  eliminarImagen.value = false;
};

const abrirCrear = () => {
  resetForm();
  modoEdicion.value = false;
  clienteEditando.value = null;
  openModal.value = true;
};

const abrirEdicion = (cliente: Cliente) => {
  modoEdicion.value = true;
  clienteEditando.value = cliente.id;

  tipoCliente.value = cliente.tipoCliente;
  nombre.value = cliente.nombre ?? "";
  apellido.value = cliente.apellido ?? "";
  razonSocial.value = cliente.razonSocial ?? "";
  nroDocumento.value = cliente.nroDocumento ?? "";
  cuit.value = cliente.cuit ?? "";
  nroTelefono.value = cliente.nroTelefono ?? "";
  email.value = cliente.email ?? "";
  direccion.value = cliente.direccion ?? "";
  localidad.value = cliente.localidad ?? "";
  provincia.value = cliente.provincia ?? "";
  codigoPostal.value = cliente.codigoPostal ?? "";
  condicionIva.value = cliente.condicionIva ?? "";
  observaciones.value = cliente.observaciones ?? "";
  activo.value = cliente.activo;

  preview.value = getImageUrl(cliente.urlImagen);
  eliminarImagen.value = false;
  imagen.value = null;
  openModal.value = true;
};

const cerrarModal = () => {
  openModal.value = false;
};

const guardar = async () => {
  try {
    const form = {
      tipoCliente: tipoCliente.value,
      nombre: nombre.value,
      apellido: apellido.value,
      razonSocial: razonSocial.value,
      nroDocumento: nroDocumento.value,
      cuit: cuit.value,
      nroTelefono: nroTelefono.value,
      email: email.value,
      direccion: direccion.value,
      localidad: localidad.value,
      provincia: provincia.value,
      codigoPostal: codigoPostal.value,
      condicionIva: condicionIva.value,
      observaciones: observaciones.value,
      activo: activo.value,
      imagen: imagen.value,
      eliminarImagen: eliminarImagen.value,
    };

    clienteSchema.parse(form);

    let ok = false;
    if (modoEdicion.value && clienteEditando.value) {
      ok = await store.editCliente(clienteEditando.value, form);
    } else {
      ok = await store.addCliente(form);
    }

    if (ok) cerrarModal();
  } catch (err: any) {
    const mensaje = err.issues?.[0]?.message || "Error en el formulario";
    notification.show(mensaje, "error");
  }
};

const abrirConfirmacion = (id: number) => {
  clienteAEliminar.value = id;
  openDeleteModal.value = true;
};

const cerrarConfirmacion = () => {
  openDeleteModal.value = false;
  clienteAEliminar.value = null;
};

const confirmarEliminacion = async () => {
  if (!clienteAEliminar.value) return;

  const ok = await store.removeCliente(clienteAEliminar.value);
  if (ok) cerrarConfirmacion();
};

const darDeBaja = async (id: number) => {
  await store.darDeBaja(id);
};

const restaurar = async (id: number) => {
  await store.restaurar(id);
};

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0] ?? null;
  imagen.value = file;
  eliminarImagen.value = false;

  if (file) {
    preview.value = URL.createObjectURL(file);
  }
};

const quitarImagen = () => {
  imagen.value = null;
  preview.value = null;
  eliminarImagen.value = true;
};

const buscarCuentaCorriente = async () => {
  if (!clienteCuentaCorriente.value) return;
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
    clienteCuentaCorriente.value.id,
    cuentaCorrienteDesde.value,
    cuentaCorrienteHasta.value,
  );
};

const abrirResumenCuentaCorriente = async (cliente: Cliente) => {
  clienteCuentaCorriente.value = cliente;
  cuentaCorrientePage.value = 1;
  openResumenCuentaCorrienteModal.value = true;
  await buscarCuentaCorriente();
};

const cerrarResumenCuentaCorriente = () => {
  openResumenCuentaCorrienteModal.value = false;
  clienteCuentaCorriente.value = null;
  cuentaCorrientePage.value = 1;
};

const abrirCobroCliente = async (cliente: Cliente) => {
  clienteCuentaCorriente.value = cliente;
  cobroCuentaCorriente.value = { idFormaPago: 0, importe: 0, referencia: "" };
  openCobroClienteModal.value = true;
  await buscarCuentaCorriente();
};

const cerrarCobroCliente = () => {
  openCobroClienteModal.value = false;
  clienteCuentaCorriente.value = null;
  cobroCuentaCorriente.value = { idFormaPago: 0, importe: 0, referencia: "" };
};

const verDetalleVentaCuentaCorriente = async (idVenta: number) => {
  const venta = await ventasStore.fetchVentaPorId(idVenta);
  if (!venta) return;
  ventaDetalleCuentaCorriente.value = venta;
  openDetalleVentaModal.value = true;
};

const cerrarDetalleVentaCuentaCorriente = () => {
  openDetalleVentaModal.value = false;
  ventaDetalleCuentaCorriente.value = null;
};

const usarSaldoPendienteCliente = (importe?: number) => {
  cobroCuentaCorriente.value.importe = Math.max(importe ?? saldoNetoCliente.value, 0);
};

const guardarCobroCuentaCorriente = async () => {
  if (!clienteCuentaCorriente.value) return;

  const { idFormaPago, importe, referencia } = cobroCuentaCorriente.value;
  if (saldoNetoCliente.value <= 0) {
    return notification.show("El cliente no tiene saldo neto pendiente para cobrar", "error");
  }
  if (idFormaPago <= 0) return notification.show("Debe seleccionar una forma de pago", "error");
  if (importe <= 0) return notification.show("El importe debe ser mayor a 0", "error");
  if (importe > saldoNetoCliente.value) {
    return notification.show("El importe no puede superar el saldo neto pendiente", "error");
  }

  const ok = await store.registrarCobroCliente({
    idCliente: clienteCuentaCorriente.value.id,
    importe,
    idFormaPago,
    referencia: referencia?.trim() || "",
  });

  if (!ok) return;

  cobroCuentaCorriente.value = { idFormaPago: 0, importe: 0, referencia: "" };
  await buscarCuentaCorriente();
  cerrarCobroCliente();
};
</script>
