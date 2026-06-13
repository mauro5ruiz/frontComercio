<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Productos</h1>

    <div class="flex flex-wrap justify-end gap-2 mb-4">
      <button
        @click="openPreciosModal = true"
        class="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
      >
        Actualización masiva
      </button>
      <button
        @click="abrirCrear"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Nuevo producto
      </button>
    </div>

    <div class="flex items-center gap-4 mb-4">
      <input id="chkEliminados" type="checkbox" v-model="incluirEliminados" />
      <label for="chkEliminados" class="cursor-pointer">
        Incluir inactivos
      </label>
      <input id="chkBajoStock" type="checkbox" v-model="soloBajoStock" />
      <label for="chkBajoStock" class="cursor-pointer">
        Mostrar solo bajo en stock
      </label>
    </div>

    <div class="grid grid-cols-1 gap-3 mb-4 md:grid-cols-3">
      <input
        v-model="search"
        placeholder="Buscar producto..."
        class="w-full border px-3 py-2 rounded"
      />

      <select
        v-model.number="filtroCategoria"
        class="w-full border px-3 py-2 rounded bg-white"
      >
        <option :value="0">Todas las categorias</option>
        <option v-for="c in categorias" :key="c.id" :value="c.id">
          {{ c.nombre }}
        </option>
      </select>

      <select
        v-model.number="filtroMarca"
        class="w-full border px-3 py-2 rounded bg-white"
      >
        <option :value="0">Todas las marcas</option>
        <option v-for="m in marcas" :key="m.id" :value="m.id">
          {{ m.nombre }}
        </option>
      </select>
    </div>

    <table class="w-full bg-white rounded shadow">
      <thead>
        <tr class="text-left border-b">
          <th class="p-2">Imagen</th>
          <th class="p-2">Nombre</th>
          <th class="p-2">Categoría</th>
          <th class="p-2">Marca</th>
          <th class="p-2">Precio Venta</th>
          <th class="p-2">Stock</th>
          <th class="p-2">Activo</th>
          <th class="p-2 text-right">Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="p in productosPaginados"
          :key="p.id"
          class="border-b hover:bg-gray-50"
        >
          <td class="p-2 w-20 h-16">
            <div class="w-full h-full flex items-center justify-center">
              <img
                v-if="p.previewImagen"
                :src="p.previewImagen"
                class="max-w-full max-h-full object-contain"
              />
              <span v-else class="text-gray-400 text-xs">Sin imagen</span>
            </div>
          </td>

          <td class="p-2">{{ p.nombre }}</td>
          <td class="p-2">{{ nombreCategoria(p) }}</td>
          <td class="p-2">{{ nombreMarca(p) }}</td>
          <td class="p-2">$ {{ p.precioVenta }}</td>
          <td class="p-2">
            <span :class="p.stockActual <= p.stockMinimo ? 'text-red-500 font-semibold' : ''">
              {{ p.stockActual }}
            </span>
          </td>
          <td class="p-2">
            <span :class="p.activo ? 'text-green-600' : 'text-red-500'">
              {{ p.activo ? "Sí" : "No" }}
            </span>
          </td>

          <td class="p-2 text-right">
            <button @click="abrirEdicion(p)" class="text-blue-500 mr-2 cursor-pointer" title="Editar">✏️</button>
            <button @click="abrirPrecioIndividual(p)" class="text-indigo-500 mr-2 cursor-pointer" title="Actualizar precio">💲</button>
            <button
              v-if="p.activo"
              @click="darDeBaja(p.id)"
              class="text-yellow-500 mr-2 cursor-pointer"
              title="Dar de baja"
            >
              ⛔
            </button>

            <button
              v-else
              @click="restaurar(p.id)"
              class="text-green-500 mr-2 cursor-pointer"
              title="Restaurar"
            >
              ♻️
            </button>

            <button @click="abrirConfirmacion(p.id)" class="text-red-500 cursor-pointer" title="Eliminar">
              🗑️
            </button>
          </td>
        </tr>

        <tr v-if="productosFiltrados.length === 0">
          <td colspan="8" class="text-center py-4 text-gray-400">
            No hay productos
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
        Anterior
      </button>

      <span class="text-sm">
        Página {{ page }} de {{ totalPaginas }}
      </span>

      <button
        @click="page++"
        :disabled="page === totalPaginas"
        class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        Siguiente
      </button>
    </div>

    <!-- MODAL CREAR / EDITAR -->
    <div
      v-if="openModal"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
        <div class="px-6 py-4 border-b bg-gray-50 rounded-t-xl">
          <h2 class="text-lg font-bold text-gray-800">
            {{ modoEdicion ? "Editar Producto" : "Nuevo Producto" }}
          </h2>
        </div>

        <div class="p-6 overflow-y-auto space-y-5">
          <div>
            <h3 class="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              Datos principales
            </h3>

            <div class="space-y-3">
              <div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    v-model="nombre"
                    maxlength="90"
                    class="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    :class="errores.nombre ? 'border-red-400' : 'border-gray-300'"
                  />
                </div>
                <p v-if="errores.nombre" class="text-xs text-red-500 mt-1">
                  {{ errores.nombre }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  v-model="descripcion"
                  maxlength="250"
                  rows="4"
                  class="w-full border border-gray-300 px-3 py-2 rounded-md resize-y min-h-[120px]"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-sm font-medium text-gray-700">Código</label>
                  <input v-model="codigo" maxlength="30" class="w-full border border-gray-300 px-3 py-2 rounded-md" />
                </div>

                <div>
                  <label class="text-sm font-medium text-gray-700">Código Barra</label>
                  <input v-model="codigoBarra" maxlength="80" class="w-full border border-gray-300 px-3 py-2 rounded-md" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              Clasificación
            </h3>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-sm font-medium text-gray-700">Categoría *</label>
                <select v-model.number="idCategoria" class="w-full border border-gray-300 px-3 py-2 rounded-md">
                  <option :value="0">Seleccionar</option>
                  <option v-for="c in categorias" :key="c.id" :value="c.id">
                    {{ c.nombre }}
                  </option>
                </select>
                <p v-if="errores.idCategoria" class="text-xs text-red-500 mt-1">
                  {{ errores.idCategoria }}
                </p>
              </div>

              <div>
                <label class="text-sm font-medium text-gray-700">Marca *</label>
                <select v-model.number="idMarca" class="w-full border border-gray-300 px-3 py-2 rounded-md">
                  <option :value="0">Seleccionar</option>
                  <option v-for="m in marcas" :key="m.id" :value="m.id">
                    {{ m.nombre }}
                  </option>
                </select>
                <p v-if="errores.idMarca" class="text-xs text-red-500 mt-1">
                  {{ errores.idMarca }}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              Precios y stock
            </h3>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="text-sm font-medium text-gray-700">Precio Compra</label>
                    <input
                        v-model.number="precioCompra"
                        type="number"
                        min="0"
                        class="w-full border px-3 py-2 rounded-md"
                        :class="errores.precioCompra ? 'border-red-400' : 'border-gray-300'"
                    />
                    <p v-if="errores.precioCompra" class="text-xs text-red-500 mt-1">
                        {{ errores.precioCompra }}
                    </p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-700">Precio Venta</label>
                    <input
                        v-model.number="precioVenta"
                        type="number"
                        min="0"
                        class="w-full border px-3 py-2 rounded-md"
                        :class="errores.precioVenta ? 'border-red-400' : 'border-gray-300'"
                    />
                    <p v-if="errores.precioVenta" class="text-xs text-red-500 mt-1">
                        {{ errores.precioVenta }}
                    </p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-700">Stock Mínimo</label>
                    <input
                        v-model.number="stockMinimo"
                        type="number"
                        min="0"
                        class="w-full border px-3 py-2 rounded-md"
                        :class="errores.stockMinimo ? 'border-red-400' : 'border-gray-300'"
                    />
                    <p v-if="errores.stockMinimo" class="text-xs text-red-500 mt-1">
                        {{ errores.stockMinimo }}
                    </p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-700">{{ modoEdicion ? "Stock actual" : "Stock Inicial" }}</label>
                    <input
                        v-model.number="stockInicial"
                        type="number"
                        min="0"
                        :disabled="modoEdicion"
                        class="w-full border px-3 py-2 rounded-md disabled:bg-gray-100 disabled:text-gray-500"
                        :class="errores.stockInicial ? 'border-red-400' : 'border-gray-300'"
                    />
                    <p v-if="errores.stockInicial" class="text-xs text-red-500 mt-1">
                        {{ errores.stockInicial }}
                    </p>
                </div>
            </div>
            <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer mt-3">
              <input type="checkbox" v-model="controlStock" />
              Controlar stock
            </label>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700 mb-1 block">Imagen</label>
            <input
              type="file"
              accept="image/*"
              @change="onFileChange"
              class="block w-full text-sm text-gray-600
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border
              file:border-gray-300
              file:bg-gray-100 file:text-gray-700
              hover:file:bg-gray-200 transition"
            />

            <button
              v-if="preview"
              @click="quitarImagen"
              class="text-red-500 text-sm mt-2"
            >
              Quitar imagen
            </button>

            <div v-if="preview" class="mt-3">
              <img :src="preview" class="w-24 h-24 object-contain border rounded-md" />
            </div>
          </div>

          <div class="flex items-center justify-between border-t pt-4">
            <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" v-model="activo" />
              Activo
            </label>
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

    <!-- MODAL PRECIO INDIVIDUAL -->
    <div
      v-if="openPrecioModal"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold">Actualizar precio</h2>
          <button
            @click="abrirAyudaPrecios('individual')"
            class="w-8 h-8 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100 text-base font-bold leading-none flex items-center justify-center"
            title="Ayuda sobre actualización de precios"
            aria-label="Ayuda sobre actualización de precios"
          >
            ?
          </button>
        </div>
        <p class="text-sm text-gray-600 mb-3">{{ precioProductoNombre }}</p>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo operación</label>
            <select v-model.number="precioTipoOperacion" class="w-full border px-3 py-2 rounded-md">
              <option :value="1">Fijo</option>
              <option :value="2">Margen</option>
              <option :value="3">Aumento</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Valor</label>
            <input v-model.number="precioValor" type="number" min="0" class="w-full border px-3 py-2 rounded-md" />
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-5">
          <button @click="cerrarPrecioIndividual" class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancelar</button>
          <button @click="guardarPrecioIndividual" class="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">Aplicar</button>
        </div>
      </div>
    </div>

    <!-- MODAL PRECIOS MASIVOS -->
    <div
      v-if="openPreciosModal"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold">Actualización masiva de precios</h2>
          <button
            @click="abrirAyudaPrecios('masiva')"
            class="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 text-base font-bold leading-none flex items-center justify-center"
            title="Ayuda sobre actualización de precios"
            aria-label="Ayuda sobre actualización de precios"
          >
            ?
          </button>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo operación</label>
            <select v-model.number="masivoTipoOperacion" class="w-full border px-3 py-2 rounded-md">
              <option :value="1">Fijo</option>
              <option :value="2">Margen</option>
              <option :value="3">Aumento</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Valor</label>
            <input v-model.number="masivoValor" type="number" min="0" class="w-full border px-3 py-2 rounded-md" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select v-model.number="masivoIdCategoria" class="w-full border px-3 py-2 rounded-md">
              <option :value="0">Todas</option>
              <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Marca</label>
            <select v-model.number="masivoIdMarca" class="w-full border px-3 py-2 rounded-md">
              <option :value="0">Todas</option>
              <option v-for="m in marcas" :key="m.id" :value="m.id">{{ m.nombre }}</option>
            </select>
          </div>
        </div>
        <label class="flex items-center gap-2 text-sm mt-3">
          <input type="checkbox" v-model="masivoSoloActivos" />
          Solo activos
        </label>

        <div class="flex justify-end gap-2 mt-5">
          <button @click="cerrarPreciosMasivos" class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancelar</button>
          <button @click="guardarPreciosMasivos" class="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">Aplicar a varios</button>
        </div>
      </div>
    </div>

    <!-- MODAL DELETE -->
    <div
      v-if="openDeleteModal"
      @click.self="cerrarConfirmacion"
      class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
        <h2 class="text-lg font-bold mb-3 text-gray-800">Confirmar eliminación</h2>

        <p class="text-sm text-gray-600 mb-4">
          ¿Estás seguro que querés eliminar permanentemente este producto?
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

    <!-- MODAL AYUDA PRECIOS -->
    <div
      v-if="openAyudaPreciosModal"
      @click.self="cerrarAyudaPrecios"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div class="flex items-start justify-between gap-3 mb-3">
          <h2 class="text-lg font-bold text-gray-900">Ayuda: actualización de precios</h2>
          <button
            @click="cerrarAyudaPrecios"
            class="text-gray-500 hover:text-gray-700 text-lg leading-none"
            aria-label="Cerrar ayuda"
          >
            X
          </button>
        </div>
        <p class="text-sm text-gray-600 mb-4">
          {{ contextoAyudaPrecios === "masiva" ? "En masiva aplicás la regla a varios productos según filtros." : "En individual aplicás la regla solo al producto seleccionado." }}
        </p>
        <div class="space-y-2 text-sm text-gray-700">
          <p><strong>Fijo:</strong> define el precio final exacto con el valor que ingresás.</p>
          <p><strong>Margen:</strong> recalcula precio de venta usando un margen sobre el costo.</p>
          <p><strong>Aumento:</strong> incrementa el precio actual en el valor indicado.</p>
        </div>
        <div class="mt-4 rounded-md bg-gray-50 border border-gray-200 p-3 text-sm text-gray-700">
          <p class="font-semibold mb-1">Ejemplo rápido</p>
          <p>Precio actual: <strong>$1.000</strong> | Costo: <strong>$700</strong></p>
          <p><strong>Fijo (1200):</strong> nuevo precio = <strong>$1.200</strong></p>
          <p><strong>Margen (30%):</strong> nuevo precio = <strong>$910</strong> (700 + 30%)</p>
          <p><strong>Aumento (20%):</strong> nuevo precio = <strong>$1.200</strong></p>
        </div>
        <div class="flex justify-end mt-5">
          <button @click="cerrarAyudaPrecios" class="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">
            Entendido
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useNotificationStore } from "@/stores/notificaciones";
import { obtenerCategorias } from "@/modules/categorias/services";
import { obtenerMarcas } from "@/modules/marcas/services";
import type { Producto } from "@/modules/productos/types";
import { useProductosStore } from "@/modules/productos/store";

interface CatalogoItem {
  id: number;
  nombre: string;
}

const notification = useNotificationStore();
const productosStore = useProductosStore();
const categorias = ref<CatalogoItem[]>([]);
const marcas = ref<CatalogoItem[]>([]);
const productos = computed<Producto[]>(() =>
  productosStore.productos.map((p) => ({ ...p, previewImagen: resolverImagenProducto(p) }))
);

const search = ref("");
const filtroCategoria = ref(0);
const filtroMarca = ref(0);
const incluirEliminados = ref(false);
const soloBajoStock = ref(false);

const openModal = ref(false);
const openDeleteModal = ref(false);
const openPrecioModal = ref(false);
const openPreciosModal = ref(false);
const openAyudaPreciosModal = ref(false);
const contextoAyudaPrecios = ref<"individual" | "masiva">("masiva");

const modoEdicion = ref(false);
const productoEditando = ref<number | null>(null);
const productoAEliminar = ref<number | null>(null);

const nombre = ref("");
const descripcion = ref("");
const codigo = ref("");
const codigoBarra = ref("");
const idCategoria = ref(0);
const idMarca = ref(0);
const precioCompra = ref(0);
const precioVenta = ref(0);
const stockMinimo = ref(0);
const stockInicial = ref(0);
const controlStock = ref(true);
const activo = ref(true);

const imagen = ref<File | null>(null);
const preview = ref<string | null>(null);
const eliminarImagen = ref(false);

const errores = ref<Record<string, string | undefined>>({});

const page = ref(1);
const pageSize = 7;
const baseFilesUrl = String(import.meta.env.VITE_FILES_URL || "").replace(/\/$/, "");
const precioProductoId = ref<number | null>(null);
const precioProductoNombre = ref("");
const precioProductoCompra = ref(0);
const precioValor = ref(0);
const precioTipoOperacion = ref(3);
const masivoValor = ref(0);
const masivoTipoOperacion = ref(3);
const masivoIdCategoria = ref(0);
const masivoIdMarca = ref(0);
const masivoSoloActivos = ref(true);

const resolverImagenProducto = (p: any): string | null => {
  const raw =
    p?.previewImagen ??
    p?.imagen ??
    p?.imagenUrl ??
    p?.urlImagen ??
    p?.rutaImagen ??
    null;

  if (!raw || typeof raw !== "string") return null;
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:")) return raw;
  if (!baseFilesUrl) return raw;
  return raw.startsWith("/") ? `${baseFilesUrl}${raw}` : `${baseFilesUrl}/${raw}`;
};

const cargarCatalogos = async () => {
  const [categoriasResult, marcasResult] = await Promise.allSettled([
    obtenerCategorias(),
    obtenerMarcas()
  ]);

  if (categoriasResult.status === "fulfilled") {
    categorias.value = categoriasResult.value;
  } else {
    categorias.value = [];
  }

  if (marcasResult.status === "fulfilled") {
    marcas.value = marcasResult.value.map((m) => ({ id: m.id, nombre: m.nombre }));
  } else {
    marcas.value = [];
  }
};

const cargarProductos = async () => {
  await productosStore.fetchProductos(incluirEliminados.value);
};

watch(search, () => {
  page.value = 1;
});

watch([filtroCategoria, filtroMarca], () => {
  page.value = 1;
});

watch(incluirEliminados, async () => {
  page.value = 1;
  await cargarProductos();
});

watch(soloBajoStock, () => {
  page.value = 1;
});

const productosFiltrados = computed(() => {
  return productos.value.filter((p) => {
    const texto = search.value.toLowerCase();
    const categoriaId = Number((p as any).idCategoria ?? 0);
    const marcaId = Number((p as any).idMarca ?? 0);

    const coincideBusqueda =
      p.nombre.toLowerCase().includes(texto) ||
      nombreCategoria(p).toLowerCase().includes(texto) ||
      nombreMarca(p).toLowerCase().includes(texto) ||
      (p.codigo ?? "").toLowerCase().includes(texto);

    const coincideCategoria = !filtroCategoria.value || categoriaId === filtroCategoria.value;
    const coincideMarca = !filtroMarca.value || marcaId === filtroMarca.value;
    const incluir = incluirEliminados.value ? true : p.activo;
    const coincideBajoStock = !soloBajoStock.value || p.stockActual <= p.stockMinimo;

    return coincideBusqueda && coincideCategoria && coincideMarca && incluir && coincideBajoStock;
  });
});

const totalPaginas = computed(() => {
  const total = Math.ceil(productosFiltrados.value.length / pageSize);
  return total === 0 ? 1 : total;
});

const nombreCategoria = (p: Producto) => {
  if (p.categoria && p.categoria.trim()) return p.categoria;
  const id = Number((p as any).idCategoria ?? 0);
  return categorias.value.find((c) => c.id === id)?.nombre ?? "-";
};

const nombreMarca = (p: Producto) => {
  if (p.marca && p.marca.trim()) return p.marca;
  const id = Number((p as any).idMarca ?? 0);
  return marcas.value.find((m) => m.id === id)?.nombre ?? "-";
};

const productosPaginados = computed(() => {
  const start = (page.value - 1) * pageSize;
  return productosFiltrados.value.slice(start, start + pageSize);
});

const resetForm = () => {
  nombre.value = "";
  descripcion.value = "";
  codigo.value = "";
  codigoBarra.value = "";
  idCategoria.value = 0;
  idMarca.value = 0;
  precioCompra.value = 0;
  precioVenta.value = 0;
  stockMinimo.value = 0;
  stockInicial.value = 0;
  controlStock.value = true;
  activo.value = true;
  imagen.value = null;
  preview.value = null;
  eliminarImagen.value = false;
  errores.value = {};
};

const abrirCrear = () => {
  modoEdicion.value = false;
  productoEditando.value = null;
  resetForm();
  openModal.value = true;
};

const abrirEdicion = async (p: Producto) => {
  modoEdicion.value = true;
  productoEditando.value = p.id;
  errores.value = {};

  try {
    const data = await productosStore.getProductoPorId(p.id);
    nombre.value = data.nombre ?? "";
    descripcion.value = data.descripcion ?? "";
    codigo.value = data.codigo ?? "";
    codigoBarra.value = data.codigoBarra ?? "";
    idCategoria.value = data.idCategoria ?? 0;
    idMarca.value = data.idMarca ?? 0;
    precioCompra.value = data.precioCompra ?? 0;
    precioVenta.value = data.precioVenta ?? 0;
    stockMinimo.value = data.stockMinimo ?? 0;
    stockInicial.value = data.stockActual ?? 0;
    controlStock.value = data.controlStock ?? true;
    activo.value = data.activo ?? true;
    preview.value = resolverImagenProducto(data);
    imagen.value = null;
    eliminarImagen.value = false;

    openModal.value = true;
  } catch (err: any) {
    notification.show(err.response?.data?.error || "No se pudo cargar el producto", "error");
  }
};

const cerrarModal = () => {
  openModal.value = false;
  errores.value = {};
};

const abrirPrecioIndividual = (p: Producto) => {
  precioProductoId.value = p.id;
  precioProductoNombre.value = p.nombre;
  precioProductoCompra.value = Number(p.precioCompra ?? 0);
  precioValor.value = 0;
  precioTipoOperacion.value = 3;
  openPrecioModal.value = true;
};

const resetPrecioIndividual = () => {
  precioProductoId.value = null;
  precioProductoNombre.value = "";
  precioProductoCompra.value = 0;
  precioValor.value = 0;
  precioTipoOperacion.value = 3;
};

const cerrarPrecioIndividual = () => {
  openPrecioModal.value = false;
  resetPrecioIndividual();
};

const resetPreciosMasivos = () => {
  masivoValor.value = 0;
  masivoTipoOperacion.value = 3;
  masivoIdCategoria.value = 0;
  masivoIdMarca.value = 0;
  masivoSoloActivos.value = true;
};

const cerrarPreciosMasivos = () => {
  openPreciosModal.value = false;
  resetPreciosMasivos();
};

const refrescarSegunModo = async () => {
  await cargarProductos();
};

const abrirAyudaPrecios = (contexto: "individual" | "masiva") => {
  contextoAyudaPrecios.value = contexto;
  openAyudaPreciosModal.value = true;
};

const cerrarAyudaPrecios = () => {
  openAyudaPreciosModal.value = false;
};

const guardarPrecioIndividual = async () => {
  if (!precioProductoId.value) return;
  if (precioValor.value < 0) {
    notification.show("El valor no puede ser negativo", "error");
    return;
  }
  if (precioTipoOperacion.value === 1 && precioValor.value <= precioProductoCompra.value) {
    notification.show(
      `Para precio fijo, el precio de venta debe ser mayor al precio de compra ($${precioProductoCompra.value}).`,
      "error"
    );
    return;
  }

  const ok = await productosStore.patchPrecioIndividual(precioProductoId.value, {
    valor: precioValor.value,
    tipoOperacion: precioTipoOperacion.value
  });
  if (!ok) return;
  cerrarPrecioIndividual();
  await refrescarSegunModo();
};

const guardarPreciosMasivos = async () => {
  if (masivoValor.value < 0) {
    notification.show("El valor no puede ser negativo", "error");
    return;
  }
  if (masivoTipoOperacion.value === 1) {
    const productosObjetivo = productos.value.filter((p) => {
      const coincideCategoria = !masivoIdCategoria.value || Number((p as any).idCategoria ?? 0) === masivoIdCategoria.value;
      const coincideMarca = !masivoIdMarca.value || Number((p as any).idMarca ?? 0) === masivoIdMarca.value;
      const coincideActivo = masivoSoloActivos.value ? p.activo : true;
      return coincideCategoria && coincideMarca && coincideActivo;
    });

    const invalidos = productosObjetivo.filter((p) => masivoValor.value <= Number(p.precioCompra ?? 0));
    if (invalidos.length > 0) {
      notification.show(
        `Precio fijo inválido: debe ser mayor al precio de compra en ${invalidos.length} producto(s) afectado(s).`,
        "error"
      );
      return;
    }
  }

  const r = await productosStore.patchPreciosMasivos({
    valor: masivoValor.value,
    tipoOperacion: masivoTipoOperacion.value,
    idCategoria: masivoIdCategoria.value || null,
    idMarca: masivoIdMarca.value || null,
    soloActivos: masivoSoloActivos.value
  });
  if (!r.ok) return;
  cerrarPreciosMasivos();
  await refrescarSegunModo();
};

const validar = () => {
  errores.value = {};

  if (!nombre.value.trim()) errores.value.nombre = "El nombre es obligatorio.";
  if (nombre.value.length > 90) errores.value.nombre = "El nombre no puede superar los 90 caracteres.";
  if (descripcion.value.length > 250) errores.value.descripcion = "La descripcion no puede superar los 250 caracteres.";
  if (codigo.value.length > 30) errores.value.codigo = "El codigo no puede superar los 30 caracteres.";
  if (codigoBarra.value.length > 80) errores.value.codigoBarra = "El codigo de barra no puede superar los 80 caracteres.";
  if (!idCategoria.value) errores.value.idCategoria = "La categoria es obligatoria.";
  if (!idMarca.value) errores.value.idMarca = "La marca es obligatoria.";
  if (precioCompra.value < 0) errores.value.precioCompra = "El precio de compra no puede ser negativo.";
  if (precioVenta.value < 0) errores.value.precioVenta = "El precio de venta no puede ser negativo.";
  if (stockMinimo.value < 0) errores.value.stockMinimo = "El stock minimo no puede ser negativo.";
  if (!modoEdicion.value && stockInicial.value < 0) errores.value.stockInicial = "El stock inicial no puede ser negativo.";

  return Object.keys(errores.value).length === 0;
};

const guardar = async () => {
  if (!validar()) return;

  const formData = new FormData();
  formData.append("nombre", nombre.value);
  formData.append("descripcion", descripcion.value);
  formData.append("codigo", codigo.value);
  formData.append("codigoBarra", codigoBarra.value);
  formData.append("idCategoria", String(idCategoria.value));
  formData.append("idMarca", String(idMarca.value));
  formData.append("precioCompra", String(precioCompra.value));
  formData.append("precioVenta", String(precioVenta.value));
  formData.append("activo", String(activo.value));
  formData.append("controlStock", String(controlStock.value));
  formData.append("stockMinimo", String(stockMinimo.value));
  formData.append("eliminarImagen", String(eliminarImagen.value));

  if (!modoEdicion.value) formData.append("stockInicial", String(stockInicial.value));
  if (imagen.value) formData.append("imagen", imagen.value);

  let ok = false;
  if (modoEdicion.value && productoEditando.value) {
    ok = await productosStore.editProducto(productoEditando.value, formData);
  } else {
    ok = await productosStore.addProducto(formData);
  }
  if (!ok) return;

  cerrarModal();
  await refrescarSegunModo();
};

const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  imagen.value = file;
  preview.value = URL.createObjectURL(file);
  eliminarImagen.value = false;
};

const quitarImagen = () => {
  imagen.value = null;
  preview.value = null;
  eliminarImagen.value = true;
};

const abrirConfirmacion = (id: number) => {
  productoAEliminar.value = id;
  openDeleteModal.value = true;
};

const cerrarConfirmacion = () => {
  productoAEliminar.value = null;
  openDeleteModal.value = false;
};

const confirmarEliminacion = async () => {
  if (!productoAEliminar.value) return;

  const ok = await productosStore.removeProducto(productoAEliminar.value);
  if (!ok) return;
  await refrescarSegunModo();
  cerrarConfirmacion();
};

const darDeBaja = async (id: number) => {
  const ok = await productosStore.bajaProducto(id);
  if (!ok) return;
  await refrescarSegunModo();
};

const restaurar = async (id: number) => {
  const ok = await productosStore.restoreProducto(id);
  if (!ok) return;
  await refrescarSegunModo();
};

onMounted(async () => {
  try {
    await cargarCatalogos();
    await refrescarSegunModo();
  } catch {
    notification.show("No se pudo conectar con la API. Verificá backend y VITE_API_URL.", "error");
  }
});
</script>


