<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">
      Ajuste de Stock
    </h1>

    <div class="bg-white rounded shadow p-6 max-w-2xl">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2">
          <label class="block text-sm font-medium mb-1">
            Producto *
          </label>

          <select
            v-model.number="form.idProducto"
            class="w-full border px-3 py-2 rounded"
          >
            <option :value="0">
              -- Seleccione un producto --
            </option>

            <option
              v-for="p in productos"
              :key="p.id"
              :value="p.id"
            >
              {{ p.nombre }}
            </option>
          </select>

          <p
            v-if="errores.idProducto"
            class="text-red-500 text-sm mt-1"
          >
            {{ errores.idProducto }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">
            Stock actual del sistema
          </label>

          <input
            :value="stockSistema"
            disabled
            class="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">
            Stock real *
          </label>

          <input
            v-model.number="form.stockReal"
            type="number"
            min="0"
            step="1"
            class="w-full border px-3 py-2 rounded"
          />

          <p
            v-if="errores.stockReal"
            class="text-red-500 text-sm mt-1"
          >
            {{ errores.stockReal }}
          </p>
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium mb-1">
            Diferencia
          </label>

          <div
            class="border rounded px-3 py-2 font-semibold"
            :class="colorDiferencia"
          >
            {{ diferenciaTexto }}
          </div>
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium mb-1">
            Observaciones
          </label>

          <textarea
            v-model="form.motivo"
            rows="4"
            maxlength="200"
            class="w-full border px-3 py-2 rounded"
            placeholder="Explique el motivo del ajuste..."
          />

          <p
            v-if="errores.motivo"
            class="text-red-500 text-sm mt-1"
          >
            {{ errores.motivo }}
          </p>
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-6">
        <button
          @click="limpiar"
          class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          Limpiar
        </button>

        <button
          @click="guardar"
          :disabled="loading"
          class="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {{ loading ? "Guardando..." : "Ajustar stock" }}
        </button>
      </div>
    </div>

    <div class="mt-8">
      <h2 class="text-lg font-bold mb-4">
        Ultimos ajustes
      </h2>

      <table class="w-full bg-white rounded shadow">
        <thead>
          <tr class="border-b text-left">
            <th class="p-3">Fecha</th>
            <th class="p-3">Producto</th>
            <th class="p-3">Cantidad</th>
            <th class="p-3">Observaciones</th>
            <th class="p-3 text-right">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="a in ajustesPaginados"
            :key="`${a.idReferencia}-${a.idProducto}-${a.fecha}`"
            class="border-b hover:bg-gray-50"
          >
            <td class="p-3">{{ formatearFecha(a.fecha) }}</td>
            <td class="p-3">{{ a.producto }}</td>
            <td class="p-3 font-semibold" :class="a.cantidad >= 0 ? 'text-green-600' : 'text-red-500'">
              {{ a.cantidad > 0 ? "+" : "" }}{{ a.cantidad }}
            </td>
            <td class="p-3">{{ a.observaciones || "-" }}</td>
            <td class="p-3 text-right">
              <button
                @click="abrirEdicion(a)"
                class="text-blue-500 cursor-pointer inline-flex items-center justify-center rounded-full p-1.5 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                title="Editar ajuste"
                aria-label="Editar ajuste"
              >
                ✏️
              </button>
            </td>
          </tr>

          <tr v-if="!ajustes.length">
            <td colspan="5" class="text-center py-5 text-gray-400">
              No hay ajustes registrados
            </td>
          </tr>
        </tbody>
      </table>

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
    </div>

    <div
      v-if="modoEdicion"
      @click.self="cancelarEdicion"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
    >
      <div class="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
        <div class="mb-5 flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-slate-500">Detalle del ajuste</p>
            <h2 class="text-xl font-bold text-slate-900">Editar observaciones</h2>
          </div>
          <button
            @click="cancelarEdicion"
            class="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Producto</p>
            <p class="mt-2 text-lg font-semibold text-slate-900">
              {{ productoSeleccionado?.nombre || ajusteEditando?.producto || "-" }}
            </p>
            <p class="mt-3 text-sm text-slate-500">
              Fecha del movimiento: {{ ajusteEditando ? formatearFecha(ajusteEditando.fecha) : "-" }}
            </p>
          </div>

          <div
            class="rounded-xl border p-4"
            :class="(ajusteEditando?.cantidad ?? 0) >= 0 ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'"
          >
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Impacto</p>
            <p
              class="mt-2 text-3xl font-bold"
              :class="(ajusteEditando?.cantidad ?? 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'"
            >
              {{ (ajusteEditando?.cantidad ?? 0) > 0 ? "+" : "" }}{{ ajusteEditando?.cantidad ?? 0 }}
            </p>
            <p class="mt-2 text-sm text-slate-600">Unidades ajustadas</p>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-1 gap-4">
          <div class="rounded-xl border border-slate-200 bg-white p-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Stock actual</p>
            <p class="mt-2 text-2xl font-semibold text-slate-900">{{ stockSistema }}</p>
          </div>
        </div>

        <div class="mt-5">
          <label class="block text-sm font-medium mb-1">
            Observaciones
          </label>

          <textarea
            v-model="form.motivo"
            rows="5"
            maxlength="200"
            class="w-full border px-3 py-2 rounded"
            placeholder="Edite las observaciones del ajuste..."
          />

          <p
            v-if="errores.motivo"
            class="text-red-500 text-sm mt-1"
          >
            {{ errores.motivo }}
          </p>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <button
            @click="cancelarEdicion"
            class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancelar
          </button>

          <button
            @click="guardarEdicion"
            :disabled="loading"
            class="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {{ loading ? "Guardando..." : "Guardar cambios" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { ajustarStock, obtenerAjustesStock } from "@/modules/ajustesStock/services";
import type { AjusteStockLecturaDto } from "@/modules/ajustesStock/types";
import { useProductosStore } from "@/modules/productos/store";
import { useNotificationStore } from "@/stores/notificaciones";

const notification = useNotificationStore();
const productosStore = useProductosStore();

const loading = ref(false);
const page = ref(1);
const pageSize = 5;
const modoEdicion = ref(false);
const ajusteEditando = ref<AjusteStockLecturaDto | null>(null);

const productos = computed(() => productosStore.productos.filter((p) => p.activo));
const ajustes = ref<AjusteStockLecturaDto[]>([]);

const form = ref({
  idProducto: 0,
  stockReal: 0,
  motivo: ""
});

const errores = ref<Record<string, string>>({});

const productoSeleccionado = computed(() => {
  return productos.value.find((p) => p.id === form.value.idProducto);
});

const stockSistema = computed(() => {
  return productoSeleccionado.value?.stockActual ?? 0;
});

const diferencia = computed(() => {
  return form.value.stockReal - stockSistema.value;
});

const diferenciaTexto = computed(() => {
  if (!form.value.idProducto) return "-";
  if (diferencia.value > 0) return `+${diferencia.value} unidades`;
  if (diferencia.value < 0) return `${diferencia.value} unidades`;
  return "Sin diferencia";
});

const colorDiferencia = computed(() => {
  if (diferencia.value > 0) return "text-green-600";
  if (diferencia.value < 0) return "text-red-500";
  return "text-gray-500";
});

const totalPaginas = computed(() => {
  const total = Math.ceil(ajustes.value.length / pageSize);
  return total === 0 ? 1 : total;
});

const ajustesPaginados = computed(() => {
  const start = (page.value - 1) * pageSize;
  return ajustes.value.slice(start, start + pageSize);
});

watch(
  () => ajustes.value.length,
  () => {
    if (page.value > totalPaginas.value) {
      page.value = totalPaginas.value;
    }
  }
);

watch(
  () => form.value.idProducto,
  () => {
    if (!modoEdicion.value) {
      form.value.stockReal = stockSistema.value;
    }
  }
);

const cargarAjustes = async () => {
  try {
    ajustes.value = await obtenerAjustesStock();
    page.value = 1;
  } catch (error: any) {
    console.error("Error al cargar ajustes de stock", {
      message: error?.message,
      status: error?.response?.status,
      data: error?.response?.data,
      url: error?.config?.url,
      baseURL: error?.config?.baseURL
    });
    const message =
      error.response?.data?.error ||
      error.response?.data?.Error ||
      (error.response?.status ? `No se pudieron cargar los ajustes (${error.response.status})` : null) ||
      error.message ||
      "No se pudieron cargar los ajustes";
    notification.show(message, "error");
  }
};

const validar = () => {
  errores.value = {};

  if (!modoEdicion.value && !form.value.idProducto) {
    errores.value.idProducto = "Seleccione un producto";
  }

  if (!modoEdicion.value && (!Number.isInteger(form.value.stockReal) || form.value.stockReal < 0)) {
    errores.value.stockReal = "El stock debe ser un numero entero mayor o igual a 0";
  }

  if (!form.value.motivo.trim()) {
    errores.value.motivo = "Las observaciones son obligatorias";
  }

  if (form.value.motivo.trim().length > 200) {
    errores.value.motivo = "Las observaciones no pueden superar los 200 caracteres";
  }

  if (!modoEdicion.value && diferencia.value === 0) {
    errores.value.stockReal = "No hay diferencia de stock";
  }

  return Object.keys(errores.value).length === 0;
};

const limpiar = () => {
  form.value = {
    idProducto: 0,
    stockReal: 0,
    motivo: ""
  };
  errores.value = {};
};

const cancelarEdicion = () => {
  modoEdicion.value = false;
  ajusteEditando.value = null;
  limpiar();
};

const abrirEdicion = (ajuste: AjusteStockLecturaDto) => {
  modoEdicion.value = true;
  ajusteEditando.value = ajuste;
  form.value = {
    idProducto: ajuste.idProducto,
    stockReal: 0,
    motivo: ajuste.observaciones || ""
  };
  errores.value = {};
};

const guardar = async () => {
  if (!validar()) return;

  try {
    loading.value = true;

    await ajustarStock({
      idProducto: form.value.idProducto,
      stockReal: form.value.stockReal,
      motivo: form.value.motivo.trim()
    });

    notification.show("Stock ajustado correctamente", "success");
    await productosStore.fetchProductos(false);
    await cargarAjustes();
    limpiar();
  } catch (error: any) {
    const message = error.response?.data?.error || error.response?.data?.Error || error.message || "Ocurrio un error";
    notification.show(message, "error");
  } finally {
    loading.value = false;
  }
};

const guardarEdicion = async () => {
  if (!validar()) return;
  notification.show("Falta el endpoint de edicion para guardar cambios del ajuste", "info");
};

const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleString("es-AR");
};

onMounted(async () => {
  await productosStore.fetchProductos(false);
  await cargarAjustes();
});
</script>
