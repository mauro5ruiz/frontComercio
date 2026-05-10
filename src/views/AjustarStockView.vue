<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">
      Ajuste de Stock
    </h1>

    <!-- FORMULARIO -->
    <div class="bg-white rounded shadow p-6 max-w-2xl">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <!-- PRODUCTO -->
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

            <!-- STOCK SISTEMA -->
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

            <!-- STOCK REAL -->
            <div>
            <label class="block text-sm font-medium mb-1">
                Stock real *
            </label>

            <input
                v-model.number="form.stockReal"
                type="number"
                min="0"
                class="w-full border px-3 py-2 rounded"
            />

            <p
                v-if="errores.stockReal"
                class="text-red-500 text-sm mt-1"
            >
                {{ errores.stockReal }}
            </p>
            </div>

            <!-- DIFERENCIA -->
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

            <!-- MOTIVO -->
            <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">
                Motivo
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

        <!-- BOTONES -->
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

    <!-- HISTORIAL -->
    <div class="mt-8">
      <h2 class="text-lg font-bold mb-4">
        Últimos ajustes
      </h2>

      <table class="w-full bg-white rounded shadow">
        <thead>
          <tr class="border-b text-left">
            <th class="p-3">Fecha</th>
            <th class="p-3">Producto</th>
            <th class="p-3">Stock sistema</th>
            <th class="p-3">Stock real</th>
            <th class="p-3">Diferencia</th>
            <th class="p-3">Motivo</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="a in ajustesPaginados"
            :key="a.id"
            class="border-b hover:bg-gray-50"
          >
            <td class="p-3">
              {{ formatearFecha(a.fecha) }}
            </td>

            <td class="p-3">
              {{ a.producto }}
            </td>

            <td class="p-3">
              {{ a.stockSistema }}
            </td>

            <td class="p-3">
              {{ a.stockReal }}
            </td>

            <td
              class="p-3 font-semibold"
              :class="a.diferencia >= 0 ? 'text-green-600' : 'text-red-500'"
            >
              {{ a.diferencia > 0 ? "+" : "" }}{{ a.diferencia }}
            </td>

            <td class="p-3">
              {{ a.motivo }}
            </td>
          </tr>

          <tr v-if="!ajustes.length">
            <td colspan="6" class="text-center py-5 text-gray-400">
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

        <span class="text-sm">Página {{ page }} de {{ totalPaginas }}</span>

        <button
          @click="page++"
          :disabled="page === totalPaginas"
          class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

interface Producto {
  id: number;
  nombre: string;
  stock: number;
}

interface Ajuste {
  id: number;
  fecha: string;
  producto: string;
  stockSistema: number;
  stockReal: number;
  diferencia: number;
  motivo: string;
}

const loading = ref(false);
const page = ref(1);
const pageSize = 5;

const productos = ref<Producto[]>([
  {
    id: 1,
    nombre: "Coca Cola 2.25L",
    stock: 25
  },
  {
    id: 2,
    nombre: "Galletitas surtidas",
    stock: 40
  },
  {
    id: 3,
    nombre: "Jabón líquido",
    stock: 12
  }
]);

// MOCK HISTORIAL
const ajustes = ref<Ajuste[]>([
  {
    id: 1,
    fecha: "2026-05-08T10:15:00Z",
    producto: "Coca Cola 2.25L",
    stockSistema: 20,
    stockReal: 25,
    diferencia: 5,
    motivo: "Ingreso manual por diferencia"
  },
  {
    id: 2,
    fecha: "2026-05-07T14:30:00Z",
    producto: "Jabón líquido",
    stockSistema: 15,
    stockReal: 12,
    diferencia: -3,
    motivo: "Conteo físico"
  }
]);

const form = ref({
  idProducto: 0,
  stockReal: 0,
  motivo: ""
});

const errores = ref<Record<string, string>>({});

const productoSeleccionado = computed(() => {
  return productos.value.find(
    p => p.id === form.value.idProducto
  );
});

const stockSistema = computed(() => {
  return productoSeleccionado.value?.stock ?? 0;
});

const diferencia = computed(() => {
  return form.value.stockReal - stockSistema.value;
});

const diferenciaTexto = computed(() => {
  if (!form.value.idProducto)
    return "-";

  if (diferencia.value > 0)
    return `+${diferencia.value} unidades`;

  if (diferencia.value < 0)
    return `${diferencia.value} unidades`;

  return "Sin diferencia";
});

const colorDiferencia = computed(() => {
  if (diferencia.value > 0)
    return "text-green-600";

  if (diferencia.value < 0)
    return "text-red-500";

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
    form.value.stockReal = stockSistema.value;
  }
);

const validar = () => {
  errores.value = {};

  if (!form.value.idProducto) {
    errores.value.idProducto =
      "Seleccione un producto";
  }

  if (form.value.stockReal < 0) {
    errores.value.stockReal =
      "El stock no puede ser negativo";
  }

  if (!form.value.motivo.trim()) {
    errores.value.motivo =
      "El motivo es obligatorio";
  }

  if (diferencia.value === 0) {
    errores.value.stockReal =
      "No hay diferencia de stock";
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

// MOCK GUARDADO
const guardar = async () => {
  if (!validar()) return;

  try {
    loading.value = true;

    // simulación delay backend
    await new Promise(resolve =>
      setTimeout(resolve, 700)
    );

    const producto = productos.value.find(
      p => p.id === form.value.idProducto
    );

    if (!producto) {
      throw new Error("Producto no encontrado");
    }

    const nuevoAjuste: Ajuste = {
      id: Date.now(),
      fecha: new Date().toISOString(),
      producto: producto.nombre,
      stockSistema: producto.stock,
      stockReal: form.value.stockReal,
      diferencia: diferencia.value,
      motivo: form.value.motivo
    };

    // guardar historial en memoria
    ajustes.value.unshift(nuevoAjuste);
    page.value = 1;

    // actualizar stock local
    producto.stock = form.value.stockReal;

    alert("Stock ajustado correctamente");

    limpiar();
  }
  catch (error: any) {
    alert(error.message || "Ocurrió un error");
  }
  finally {
    loading.value = false;
  }
};

const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleString("es-AR");
};
</script>
