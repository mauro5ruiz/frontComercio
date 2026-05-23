<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">
      Kardex de Stock
    </h1>

    <div class="flex justify-center mb-6">
      <div class="bg-white rounded shadow p-6 w-full max-w-2xl">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">
              Producto *
            </label>

            <select
              v-model.number="idProducto"
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
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="productoSeleccionado"
      class="bg-white rounded shadow p-4 mb-6"
    >
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-lg font-bold">
            {{ productoSeleccionado.nombre }}
          </h2>

          <p class="text-gray-500 text-sm">
            Historial de movimientos de stock
          </p>
        </div>

        <div class="text-right">
          <p class="text-sm text-gray-500">
            Stock actual
          </p>

          <p class="text-2xl font-bold text-blue-600">
            {{ stockActual }}
          </p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded shadow overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b text-left bg-gray-50">
            <th class="p-3">Fecha</th>
            <th class="p-3">Tipo movimiento</th>
            <th class="p-3">Cantidad</th>
            <th class="p-3">Referencia</th>
            <th class="p-3">Observaciones</th>
            <th class="p-3">Stock acumulado</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="m in movimientosPaginados"
            :key="m.id"
            class="border-b hover:bg-gray-50"
          >
            <td class="p-3">
              {{ formatearFecha(m.fecha) }}
            </td>

            <td class="p-3">
              <span :class="colorMovimiento(m.idTipoMovimientoStock)">
                {{ nombreMovimiento(m.idTipoMovimientoStock) }}
              </span>
            </td>

            <td
              class="p-3 font-semibold"
              :class="m.cantidad >= 0 ? 'text-green-600' : 'text-red-500'"
            >
              {{ m.cantidad > 0 ? "+" : "" }}{{ m.cantidad }}
            </td>

            <td class="p-3">
              {{ m.idReferencia || "-" }}
            </td>

            <td class="p-3">
              {{ m.observaciones || "-" }}
            </td>

            <td class="p-3 font-bold">
              {{ m.stockAcumulado }}
            </td>
          </tr>

          <tr v-if="loading">
            <td colspan="6" class="text-center py-6 text-gray-400">
              Cargando movimientos...
            </td>
          </tr>

          <tr v-else-if="!movimientosFiltrados.length">
            <td colspan="6" class="text-center py-6 text-gray-400">
              {{ idProducto ? "No hay movimientos para este producto" : "Seleccione un producto para ver el kardex" }}
            </td>
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

      <span class="text-sm">
        Pagina {{ page }} de {{ totalPaginas }}
      </span>

      <button
        @click="page++"
        :disabled="page === totalPaginas"
        class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useNotificationStore } from "@/stores/notificaciones";
import { useProductosStore } from "@/modules/productos/store";
import { obtenerKardex } from "@/modules/kardex/services";
import type { MovimientoStock as MovimientoStockBase } from "@/modules/kardex/types";

interface MovimientoStock extends MovimientoStockBase {
  stockAcumulado: number;
}

const notification = useNotificationStore();
const productosStore = useProductosStore();

const productos = computed(() => productosStore.productos.filter((p) => p.activo));
const idProducto = ref(0);
const loading = ref(false);
const movimientosBase = ref<MovimientoStockBase[]>([]);

const productoSeleccionado = computed(() => {
  return productos.value.find((p) => p.id === idProducto.value);
});

const movimientosFiltrados = computed<MovimientoStock[]>(() => {
  const movimientosAsc = [...movimientosBase.value].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );

  let acumulado = 0;

  const conAcumulado = movimientosAsc.map((m) => {
    acumulado += m.cantidad;
    return {
      ...m,
      stockAcumulado: acumulado
    };
  });

  return conAcumulado.reverse();
});

const stockActual = computed(() => {
  return productoSeleccionado.value?.stockActual ?? 0;
});

const page = ref(1);
const pageSize = 5;

const totalPaginas = computed(() => {
  return Math.ceil(movimientosFiltrados.value.length / pageSize) || 1;
});

const movimientosPaginados = computed(() => {
  const start = (page.value - 1) * pageSize;
  return movimientosFiltrados.value.slice(start, start + pageSize);
});

watch(idProducto, async () => {
  page.value = 1;

  if (!idProducto.value) {
    movimientosBase.value = [];
    return;
  }

  loading.value = true;
  try {
    movimientosBase.value = await obtenerKardex(idProducto.value);
  } catch (error: any) {
    movimientosBase.value = [];
    const message =
      error.response?.data?.mensaje ||
      error.response?.data?.error ||
      error.response?.data?.Error ||
      "No se pudo cargar el kardex";
    notification.show(message, "error");
  } finally {
    loading.value = false;
  }
});

const nombreMovimiento = (id: number) => {
  switch (id) {
    case 1:
      return "Carga inicial";
    case 2:
      return "Compra";
    case 3:
      return "Venta";
    case 4:
      return "Devolucion compra";
    case 5:
      return "Devolucion venta";
    case 6:
      return "Perdida";
    case 7:
      return "Anulacion compra";
    case 8:
      return "Anulacion venta";
    case 9:
      return "Anulacion perdida";
    case 10:
      return "Ajuste perdida";
    case 11:
      return "Ajuste";
    default:
      return "Movimiento";
  }
};

const colorMovimiento = (id: number) => {
  switch (id) {
    case 1:
      return "text-slate-600";
    case 2:
      return "text-green-600";
    case 3:
      return "text-blue-600";
    case 4:
      return "text-emerald-600";
    case 5:
      return "text-cyan-600";
    case 6:
      return "text-red-500";
    case 7:
      return "text-orange-600";
    case 8:
      return "text-violet-600";
    case 9:
      return "text-rose-600";
    case 10:
      return "text-amber-600";
    case 11:
      return "text-yellow-600";
    default:
      return "";
  }
};

const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleString("es-AR");
};

onMounted(async () => {
  await productosStore.fetchProductos(false);
});
</script>
