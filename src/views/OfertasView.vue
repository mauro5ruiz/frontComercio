<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Ofertas</h1>

    <div class="flex justify-end mb-4">
      <button
        @click="abrirCrear"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        + Nueva oferta
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      <input
        v-model="search"
        placeholder="Buscar por producto..."
        class="border px-3 py-2 rounded"
      />
      <select v-model.number="filtroTipo" class="border px-3 py-2 rounded">
        <option :value="0">Todos los tipos</option>
        <option :value="TipoDescuento.Porcentaje">Porcentaje</option>
        <option :value="TipoDescuento.Fijo">Monto fijo</option>
        <option :value="TipoDescuento.PrecioFinal">Precio final</option>
      </select>
      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" v-model="incluirVencidas" />
        Incluir vencidas
      </label>
    </div>

    <div v-if="loading && ofertas.length" class="mb-2 text-sm text-gray-500">
      Actualizando ofertas...
    </div>

    <div class="overflow-x-auto min-h-[320px]">
      <table class="w-full bg-white rounded shadow">
        <thead>
          <tr class="text-left border-b">
            <th class="p-2">Producto</th>
            <th class="p-2">Tipo</th>
            <th class="p-2">Valor</th>
            <th class="p-2">Precio final</th>
            <th class="p-2">Inicio</th>
            <th class="p-2">Fin</th>
            <th class="p-2">Activa</th>
            <th class="p-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="o in ofertasPaginadas"
            :key="o.id"
            class="border-b hover:bg-gray-50"
          >
            <td class="p-2">{{ nombreProducto(o.idProducto) }}</td>
            <td class="p-2">{{ nombreTipo(o.tipoDescuento) }}</td>
            <td class="p-2">{{ formatearValor(o.tipoDescuento, o.valorDescuento) }}</td>
            <td class="p-2">{{ formatearPrecioFinal(o) }}</td>
            <td class="p-2">{{ formatearFecha(o.fechaInicio) }}</td>
            <td class="p-2">{{ formatearFecha(o.fechaFin) }}</td>
            <td class="p-2">
              <span :class="o.activa ? 'text-green-600' : 'text-red-500'">
                {{ o.activa ? "Si" : "No" }}
              </span>
            </td>
            <td class="p-2 text-right">
              <button
                @click="abrirEdicion(o)"
                class="text-blue-500 mr-2 cursor-pointer inline-flex items-center justify-center rounded-full p-1.5 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                title="Editar oferta"
                aria-label="Editar oferta"
              >
                ✏️
              </button>
              <button
                @click="abrirConfirmacion(o)"
                class="text-red-500 cursor-pointer inline-flex items-center justify-center rounded-full p-1.5 hover:bg-red-50 hover:text-red-600 transition-colors"
                title="Desactivar oferta"
                aria-label="Desactivar oferta"
              >
                ⛔
              </button>
            </td>
          </tr>
          <tr v-if="!loading && ofertasFiltradas.length === 0">
            <td colspan="8" class="text-center py-4 text-gray-400">No hay ofertas</td>
          </tr>
          <tr v-if="loading && !ofertas.length">
            <td colspan="8" class="text-center py-4 text-gray-400">Cargando ofertas...</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex justify-center items-center gap-2 mt-4">
      <button
        @click="page--"
        :disabled="page === 1"
        class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        ←
      </button>

      <span class="text-sm">Pagina {{ page }} de {{ totalPaginas }}</span>

      <button
        @click="page++"
        :disabled="page === totalPaginas"
        class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        →
      </button>
    </div>

    <div
      v-if="openModal"
      @click.self="cerrarModal"
      class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <h2 class="text-lg font-bold mb-4">
          {{ modoEdicion ? "Editar oferta" : "Nueva oferta" }}
        </h2>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Producto *</label>
            <div ref="productoBox" class="relative">
              <div class="relative">
                <input
                  v-model="productoSearch"
                  class="w-full border px-3 py-2 rounded pr-8"
                  :class="errores.idProducto ? 'border-red-400' : 'border-gray-300'"
                  placeholder="Buscar producto"
                  @focus="productoOpen = true"
                />
                <button
                  v-if="idProducto > 0 || productoSearch"
                  type="button"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-sm"
                  @click="limpiarProducto"
                >
                  ×
                </button>
              </div>
              <div
                v-if="productoOpen && productosFiltradosBusqueda.length"
                class="absolute z-20 w-full mt-1 bg-white border rounded-md shadow max-h-52 overflow-y-auto"
              >
                <button
                  v-for="producto in productosFiltradosBusqueda"
                  :key="producto.id"
                  type="button"
                  class="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                  @click="seleccionarProducto(producto)"
                >
                  {{ productoLabel(producto) }}
                </button>
              </div>
            </div>
            <p v-if="errores.idProducto" class="text-xs text-red-500 mt-1">{{ errores.idProducto }}</p>
          </div>

          <div v-if="productoSeleccionado" class="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
            Precio de venta actual: {{ money(productoSeleccionado.precioVenta) }}
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de descuento *</label>
            <select
              v-model.number="tipoDescuentoId"
              class="w-full border px-3 py-2 rounded"
              :class="errores.tipoDescuentoId ? 'border-red-400' : 'border-gray-300'"
            >
              <option :value="0">Seleccionar</option>
              <option :value="TipoDescuento.Porcentaje">Porcentaje</option>
              <option :value="TipoDescuento.Fijo">Monto fijo</option>
              <option :value="TipoDescuento.PrecioFinal">Precio final</option>
            </select>
            <p v-if="errores.tipoDescuentoId" class="text-xs text-red-500 mt-1">{{ errores.tipoDescuentoId }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ tipoDescuentoId === TipoDescuento.PrecioFinal ? "Precio final *" : "Valor descuento *" }}
            </label>
            <input
              v-model.number="valorDescuento"
              type="number"
              step="0.01"
              min="0"
              class="w-full border px-3 py-2 rounded"
              :class="errores.valorDescuento ? 'border-red-400' : 'border-gray-300'"
            />
            <p v-if="errores.valorDescuento" class="text-xs text-red-500 mt-1">{{ errores.valorDescuento }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha inicio *</label>
              <input
                v-model="fechaInicio"
                type="datetime-local"
                class="w-full border px-3 py-2 rounded"
                :class="errores.fechaInicio ? 'border-red-400' : 'border-gray-300'"
              />
              <p v-if="errores.fechaInicio" class="text-xs text-red-500 mt-1">{{ errores.fechaInicio }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha fin *</label>
              <input
                v-model="fechaFin"
                type="datetime-local"
                class="w-full border px-3 py-2 rounded"
                :class="errores.fechaFin ? 'border-red-400' : 'border-gray-300'"
              />
              <p v-if="errores.fechaFin" class="text-xs text-red-500 mt-1">{{ errores.fechaFin }}</p>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-5">
          <button @click="cerrarModal" class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
            Cancelar
          </button>
          <button
            @click="guardar"
            :disabled="guardando"
            class="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-60"
          >
            {{ guardando ? "Guardando..." : modoEdicion ? "Actualizar" : "Guardar" }}
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
        <h2 class="text-lg font-bold mb-3 text-gray-800">Confirmar desactivacion</h2>
        <p class="text-sm text-gray-600 mb-4">
          ¿Seguro que querés desactivar la oferta de {{ ofertaAEliminar ? nombreProducto(ofertaAEliminar.idProducto) : "este producto" }}?
        </p>
        <div class="flex justify-end gap-2">
          <button @click="cerrarConfirmacion" class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
            Cancelar
          </button>
          <button
            @click="confirmarEliminacion"
            :disabled="desactivando"
            class="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
          >
            {{ desactivando ? "Desactivando..." : "Desactivar" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useProductosStore } from "@/modules/productos/store";
import type { Producto } from "@/modules/productos/types";
import {
  actualizarOferta,
  crearOferta,
  desactivarOfertaPorProducto,
  obtenerOfertas
} from "@/modules/ofertas/services";
import { TipoDescuento, type Oferta } from "@/modules/ofertas/types";
import { useNotificationStore } from "@/stores/notificaciones";

const notification = useNotificationStore();
const productosStore = useProductosStore();

const ofertas = ref<Oferta[]>([]);
const search = ref("");
const filtroTipo = ref(0);
const incluirVencidas = ref(false);
const loading = ref(false);
const guardando = ref(false);
const desactivando = ref(false);

const page = ref(1);
const pageSize = 7;

const openModal = ref(false);
const openDeleteModal = ref(false);
const modoEdicion = ref(false);
const ofertaEditando = ref<number | null>(null);
const ofertaAEliminar = ref<Oferta | null>(null);

const idProducto = ref(0);
const tipoDescuentoId = ref(0);
const valorDescuento = ref(0);
const fechaInicio = ref("");
const fechaFin = ref("");

const productoOpen = ref(false);
const productoSearch = ref("");
const productoBox = ref<HTMLElement | null>(null);

const errores = ref<Record<string, string | undefined>>({});

const productos = computed(() => productosStore.productos.filter((p) => p.activo));
const productoSeleccionado = computed(() => productos.value.find((p) => p.id === idProducto.value) ?? null);

watch([search, filtroTipo], () => {
  page.value = 1;
});

watch(incluirVencidas, () => {
  page.value = 1;
});

const productoLabel = (producto: Producto) => {
  const marca = producto.marca?.trim();
  return marca ? `${producto.nombre} - ${marca}` : producto.nombre;
};

const productosFiltradosBusqueda = computed(() => {
  const texto = productoSearch.value.trim().toLowerCase();
  return productos.value
    .filter((producto) => {
      if (!texto) return true;
      return [
        producto.nombre,
        producto.marca,
        producto.codigo,
        producto.codigoBarra
      ]
        .filter(Boolean)
        .some((valor) => String(valor).toLowerCase().includes(texto));
    })
    .slice(0, 10);
});

const nombreProducto = (id: number) => {
  return productosStore.productos.find((p) => p.id === id)?.nombre ?? `Producto #${id}`;
};

const nombreTipo = (tipo: TipoDescuento) => {
  if (tipo === TipoDescuento.Porcentaje) return "Porcentaje";
  if (tipo === TipoDescuento.Fijo) return "Monto fijo";
  return "Precio final";
};

const money = (valor: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2
  }).format(valor);
};

const formatearValor = (tipo: TipoDescuento, valor: number) => {
  if (tipo === TipoDescuento.Porcentaje) return `${valor}%`;
  return money(valor);
};

const calcularPrecioFinal = (oferta: Oferta) => {
  const precioBase = productosStore.productos.find((p) => p.id === oferta.idProducto)?.precioVenta;
  if (precioBase == null) return null;

  if (oferta.tipoDescuento === TipoDescuento.Porcentaje) {
    return Math.max(0, precioBase - (precioBase * oferta.valorDescuento) / 100);
  }

  if (oferta.tipoDescuento === TipoDescuento.Fijo) {
    return Math.max(0, precioBase - oferta.valorDescuento);
  }

  return Math.max(0, oferta.valorDescuento);
};

const formatearPrecioFinal = (oferta: Oferta) => {
  const precioFinal = calcularPrecioFinal(oferta);
  return precioFinal == null ? "-" : money(precioFinal);
};

const formatearFecha = (valor: string) => {
  if (!valor) return "-";
  return new Date(valor).toLocaleString("es-AR");
};

const parseLocalDateTime = (valor: string) => {
  if (!valor) return null;
  const normalizado = valor.includes("T") ? valor : valor.replace(" ", "T");
  const fecha = new Date(normalizado);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

const toLocalInputValue = (valor: string) => {
  const fecha = parseLocalDateTime(valor);
  if (!fecha) return "";
  const pad = (numero: number) => String(numero).padStart(2, "0");
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}T${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
};

const toApiDateTime = (valor: string) => {
  return valor.length === 16 ? `${valor}:00` : valor;
};

const esOfertaVencida = (oferta: Oferta) => {
  const fechaFinOferta = parseLocalDateTime(oferta.fechaFin);
  if (!fechaFinOferta) return false;
  return fechaFinOferta.getTime() < Date.now();
};

const ofertasFiltradas = computed(() => {
  const texto = search.value.trim().toLowerCase();
  return ofertas.value.filter((oferta) => {
    const coincideTexto = nombreProducto(oferta.idProducto).toLowerCase().includes(texto);
    const coincideTipo = filtroTipo.value ? oferta.tipoDescuento === filtroTipo.value : true;
    const coincideVencida = incluirVencidas.value ? true : !esOfertaVencida(oferta);
    return coincideTexto && coincideTipo && coincideVencida;
  });
});

const totalPaginas = computed(() => {
  const total = Math.ceil(ofertasFiltradas.value.length / pageSize);
  return total === 0 ? 1 : total;
});

const ofertasPaginadas = computed(() => {
  const start = (page.value - 1) * pageSize;
  return ofertasFiltradas.value.slice(start, start + pageSize);
});

const resetForm = () => {
  idProducto.value = 0;
  tipoDescuentoId.value = 0;
  valorDescuento.value = 0;
  fechaInicio.value = "";
  fechaFin.value = "";
  productoSearch.value = "";
  productoOpen.value = false;
  errores.value = {};
};

const cargarOfertas = async () => {
  loading.value = true;
  try {
    ofertas.value = await obtenerOfertas(true);
  } catch (err: any) {
    notification.show(err.response?.data?.error || "No se pudieron cargar las ofertas", "error");
  } finally {
    loading.value = false;
  }
};

const cargarDatos = async () => {
  const okProductos = await productosStore.fetchProductos(false);
  if (!okProductos) return;
  await cargarOfertas();
};

const abrirCrear = () => {
  modoEdicion.value = false;
  ofertaEditando.value = null;
  resetForm();

  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
  const dd = String(hoy.getDate()).padStart(2, "0");

  fechaInicio.value = `${yyyy}-${mm}-${dd}T00:00`;
  fechaFin.value = `${yyyy}-${mm}-${dd}T23:59`;

  openModal.value = true;
};

const abrirEdicion = (oferta: Oferta) => {
  modoEdicion.value = true;
  ofertaEditando.value = oferta.id;
  errores.value = {};
  idProducto.value = oferta.idProducto;
  productoSearch.value = nombreProducto(oferta.idProducto);
  tipoDescuentoId.value = oferta.tipoDescuento;
  valorDescuento.value = oferta.valorDescuento;
  fechaInicio.value = toLocalInputValue(oferta.fechaInicio);
  fechaFin.value = toLocalInputValue(oferta.fechaFin);
  openModal.value = true;
};

const cerrarModal = () => {
  openModal.value = false;
};

const limpiarProducto = () => {
  idProducto.value = 0;
  productoSearch.value = "";
  productoOpen.value = false;
};

const seleccionarProducto = (producto: Producto) => {
  idProducto.value = producto.id;
  productoSearch.value = productoLabel(producto);
  productoOpen.value = false;
};

const validar = () => {
  errores.value = {};

  if (!idProducto.value) errores.value.idProducto = "El producto es obligatorio.";
  if (!tipoDescuentoId.value) errores.value.tipoDescuentoId = "El tipo es obligatorio.";
  if (valorDescuento.value <= 0) errores.value.valorDescuento = "El valor debe ser mayor a 0.";

  if (tipoDescuentoId.value === TipoDescuento.Porcentaje && valorDescuento.value > 100) {
    errores.value.valorDescuento = "El porcentaje no puede ser mayor a 100.";
  }

  const precioVentaProducto = productoSeleccionado.value?.precioVenta ?? 0;
  if (
    precioVentaProducto > 0 &&
    (tipoDescuentoId.value === TipoDescuento.Fijo || tipoDescuentoId.value === TipoDescuento.PrecioFinal) &&
    valorDescuento.value > precioVentaProducto
  ) {
    errores.value.valorDescuento =
      tipoDescuentoId.value === TipoDescuento.PrecioFinal
        ? `El precio final no puede superar el precio de venta (${money(precioVentaProducto)}).`
        : `El descuento no puede superar el precio de venta (${money(precioVentaProducto)}).`;
  }

  if (!fechaInicio.value) errores.value.fechaInicio = "La fecha de inicio es obligatoria.";
  if (!fechaFin.value) errores.value.fechaFin = "La fecha de fin es obligatoria.";
  const fechaInicioLocal = parseLocalDateTime(fechaInicio.value);
  const fechaFinLocal = parseLocalDateTime(fechaFin.value);
  if (fechaInicioLocal && fechaFinLocal && fechaFinLocal <= fechaInicioLocal) {
    errores.value.fechaFin = "La fecha de fin debe ser mayor a la fecha de inicio.";
  }

  return Object.keys(errores.value).length === 0;
};

const guardar = async () => {
  if (!validar()) return;

  guardando.value = true;
  try {
    const dto = {
      idProducto: idProducto.value,
      tipoDescuento: tipoDescuentoId.value as TipoDescuento,
      valorDescuento: valorDescuento.value,
      fechaInicio: toApiDateTime(fechaInicio.value),
      fechaFin: toApiDateTime(fechaFin.value)
    };

    if (modoEdicion.value && ofertaEditando.value) {
      await actualizarOferta(ofertaEditando.value, dto);
      notification.show("Oferta actualizada correctamente", "success");
    } else {
      await crearOferta(dto);
      notification.show("Oferta creada correctamente", "success");
    }

    await cargarOfertas();
    cerrarModal();
  } catch (err: any) {
    notification.show(err.response?.data?.error || "No se pudo guardar la oferta", "error");
  } finally {
    guardando.value = false;
  }
};

const abrirConfirmacion = (oferta: Oferta) => {
  ofertaAEliminar.value = oferta;
  openDeleteModal.value = true;
};

const cerrarConfirmacion = () => {
  ofertaAEliminar.value = null;
  openDeleteModal.value = false;
};

const confirmarEliminacion = async () => {
  if (!ofertaAEliminar.value) return;

  desactivando.value = true;
  try {
    await desactivarOfertaPorProducto(ofertaAEliminar.value.idProducto);
    notification.show("Oferta desactivada correctamente", "success");
    await cargarOfertas();
    cerrarConfirmacion();
  } catch (err: any) {
    notification.show(err.response?.data?.error || "No se pudo desactivar la oferta", "error");
  } finally {
    desactivando.value = false;
  }
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node | null;
  if (productoBox.value && target && !productoBox.value.contains(target)) {
    productoOpen.value = false;
  }
};

onMounted(async () => {
  document.addEventListener("click", handleClickOutside);
  await cargarDatos();
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
