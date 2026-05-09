<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Productos</h1>

    <div class="flex justify-end mb-4">
      <button
        @click="abrirCrear"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        ➕ Nuevo producto
      </button>
    </div>

    <div class="flex items-center gap-2 mb-4">
      <input id="chkEliminados" type="checkbox" v-model="incluirEliminados" />
      <label for="chkEliminados" class="cursor-pointer">
        Incluir inactivos
      </label>
    </div>

    <input
      v-model="search"
      placeholder="Buscar producto..."
      class="w-full border px-3 py-2 rounded mb-4"
    />

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
          <td class="p-2">{{ p.categoria }}</td>
          <td class="p-2">{{ p.marca }}</td>
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
            <button @click="abrirEdicion(p)" class="text-blue-500 mr-2">✏️</button>

            <button
              v-if="p.activo"
              @click="darDeBaja(p.id)"
              class="text-yellow-500 mr-2"
              title="Dar de baja"
            >
              ⛔
            </button>

            <button
              v-else
              @click="restaurar(p.id)"
              class="text-green-500 mr-2"
              title="Restaurar"
            >
              ♻️
            </button>

            <button @click="abrirConfirmacion(p.id)" class="text-red-500">
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
        ⬅
      </button>

      <span class="text-sm">
        Página {{ page }} de {{ totalPaginas }}
      </span>

      <button
        @click="page++"
        :disabled="page === totalPaginas"
        class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        ➡
      </button>
    </div>

    <!-- MODAL CREAR / EDITAR -->
    <div
      v-if="openModal"
      @click.self="cerrarModal"
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
                    <label class="text-sm font-medium text-gray-700">Stock Inicial</label>
                    <input
                        v-model.number="stockInicial"
                        type="number"
                        min="0"
                        class="w-full border px-3 py-2 rounded-md"
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
              class="text-red-500 text-sm mt-2 hover:underline"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

interface ProductoMock {
  id: number;
  nombre: string;
  descripcion?: string;
  codigo?: string;
  codigoBarra?: string;
  idCategoria: number;
  categoria: string;
  idMarca: number;
  marca: string;
  precioCompra: number;
  precioVenta: number;
  stockMinimo: number;
  stockActual: number;
  controlStock: boolean;
  activo: boolean;
  previewImagen?: string | null;
}

const categorias = ref([
  { id: 1, nombre: "Bebidas" },
  { id: 2, nombre: "Almacén" },
  { id: 3, nombre: "Limpieza" },
]);

const marcas = ref([
  { id: 1, nombre: "Coca Cola" },
  { id: 2, nombre: "Arcor" },
  { id: 3, nombre: "Ala" },
]);

const productos = ref<ProductoMock[]>([
  {
    id: 1,
    nombre: "Coca Cola 2.25L",
    descripcion: "Gaseosa retornable",
    codigo: "COCA225",
    codigoBarra: "7790895000997",
    idCategoria: 1,
    categoria: "Bebidas",
    idMarca: 1,
    marca: "Coca Cola",
    precioCompra: 1200,
    precioVenta: 1800,
    stockMinimo: 5,
    stockActual: 12,
    controlStock: true,
    activo: true,
    previewImagen: null,
  },
  {
    id: 2,
    nombre: "Galletitas surtidas",
    descripcion: "Paquete 400g",
    codigo: "GAL400",
    codigoBarra: "7790040123456",
    idCategoria: 2,
    categoria: "Almacén",
    idMarca: 2,
    marca: "Arcor",
    precioCompra: 900,
    precioVenta: 1300,
    stockMinimo: 10,
    stockActual: 4,
    controlStock: true,
    activo: true,
    previewImagen: null,
  },
  {
    id: 3,
    nombre: "Jabón líquido",
    descripcion: "Limpieza ropa",
    codigo: "JABLIQ",
    codigoBarra: "7790000111222",
    idCategoria: 3,
    categoria: "Limpieza",
    idMarca: 3,
    marca: "Ala",
    precioCompra: 2500,
    precioVenta: 3400,
    stockMinimo: 3,
    stockActual: 8,
    controlStock: true,
    activo: false,
    previewImagen: null,
  },
]);

const search = ref("");
const incluirEliminados = ref(false);

const openModal = ref(false);
const openDeleteModal = ref(false);

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

const errores = ref<Record<string, string | undefined>>({});

const page = ref(1);
const pageSize = 7;

watch(search, () => {
  page.value = 1;
});

watch(incluirEliminados, () => {
  page.value = 1;
});

const productosFiltrados = computed(() => {
  return productos.value.filter((p) => {
    const texto = search.value.toLowerCase();

    const coincideBusqueda =
      p.nombre.toLowerCase().includes(texto) ||
      p.categoria.toLowerCase().includes(texto) ||
      p.marca.toLowerCase().includes(texto) ||
      (p.codigo ?? "").toLowerCase().includes(texto);

    const incluir = incluirEliminados.value ? true : p.activo;

    return coincideBusqueda && incluir;
  });
});

const totalPaginas = computed(() => {
  const total = Math.ceil(productosFiltrados.value.length / pageSize);
  return total === 0 ? 1 : total;
});

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
  errores.value = {};
};

const abrirCrear = () => {
  modoEdicion.value = false;
  productoEditando.value = null;
  resetForm();
  openModal.value = true;
};

const abrirEdicion = (p: ProductoMock) => {
  modoEdicion.value = true;
  productoEditando.value = p.id;
  errores.value = {};

  nombre.value = p.nombre;
  descripcion.value = p.descripcion ?? "";
  codigo.value = p.codigo ?? "";
  codigoBarra.value = p.codigoBarra ?? "";
  idCategoria.value = p.idCategoria;
  idMarca.value = p.idMarca;
  precioCompra.value = p.precioCompra;
  precioVenta.value = p.precioVenta;
  stockMinimo.value = p.stockMinimo;
  stockInicial.value = p.stockActual;
  controlStock.value = p.controlStock;
  activo.value = p.activo;
  preview.value = p.previewImagen ?? null;
  imagen.value = null;

  openModal.value = true;
};

const cerrarModal = () => {
  openModal.value = false;
  errores.value = {};
};

const validar = () => {
  errores.value = {};

  if (!nombre.value.trim()) {
    errores.value.nombre = "El nombre es obligatorio.";
  }

  if (nombre.value.length > 90) {
    errores.value.nombre = "El nombre no puede superar los 90 caracteres.";
  }

  if (descripcion.value.length > 250) {
    errores.value.descripcion = "La descripción no puede superar los 250 caracteres.";
  }

  if (codigo.value.length > 30) {
    errores.value.codigo = "El código no puede superar los 30 caracteres.";
  }

  if (codigoBarra.value.length > 80) {
    errores.value.codigoBarra = "El código de barra no puede superar los 80 caracteres.";
  }

  if (!idCategoria.value) {
    errores.value.idCategoria = "La categoría es obligatoria.";
  }

  if (!idMarca.value) {
    errores.value.idMarca = "La marca es obligatoria.";
  }

  if (precioCompra.value <= 0) {
    errores.value.precioCompra = "El precio de compra debe ser mayor a 0.";
  }

  if (precioVenta.value <= 0) {
    errores.value.precioVenta = "El precio de venta debe ser mayor a 0.";
  }

  if (precioVenta.value < precioCompra.value) {
    errores.value.precioVenta = "El precio de venta no puede ser menor al precio de compra.";
  }

  if (stockMinimo.value < 0) {
    errores.value.stockMinimo = "El stock mínimo no puede ser negativo.";
  }

  if (stockInicial.value <= 0) {
    errores.value.stockInicial = "El stock inicial debe ser mayor a 0.";
  }

  return Object.keys(errores.value).length === 0;
};

const guardar = () => {
  if (!validar()) return;

  const categoria = categorias.value.find((c) => c.id === idCategoria.value);
  const marca = marcas.value.find((m) => m.id === idMarca.value);

  if (!categoria || !marca) return;

  if (modoEdicion.value && productoEditando.value) {
    const index = productos.value.findIndex((p) => p.id === productoEditando.value);

    if (index !== -1) {
      productos.value[index] = {
        ...productos.value[index],
        nombre: nombre.value,
        descripcion: descripcion.value || undefined,
        codigo: codigo.value || undefined,
        codigoBarra: codigoBarra.value || undefined,
        idCategoria: idCategoria.value,
        categoria: categoria.nombre,
        idMarca: idMarca.value,
        marca: marca.nombre,
        precioCompra: precioCompra.value,
        precioVenta: precioVenta.value,
        stockMinimo: stockMinimo.value,
        stockActual: stockInicial.value,
        controlStock: controlStock.value,
        activo: activo.value,
        previewImagen: preview.value,
      };
    }
  } else {
    const nuevoId = Math.max(...productos.value.map((p) => p.id), 0) + 1;

    productos.value.unshift({
      id: nuevoId,
      nombre: nombre.value,
      descripcion: descripcion.value || undefined,
      codigo: codigo.value || undefined,
      codigoBarra: codigoBarra.value || undefined,
      idCategoria: idCategoria.value,
      categoria: categoria.nombre,
      idMarca: idMarca.value,
      marca: marca.nombre,
      precioCompra: precioCompra.value,
      precioVenta: precioVenta.value,
      stockMinimo: stockMinimo.value,
      stockActual: stockInicial.value,
      controlStock: controlStock.value,
      activo: activo.value,
      previewImagen: preview.value,
    });
  }

  cerrarModal();
};

const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  imagen.value = file;
  preview.value = URL.createObjectURL(file);
};

const quitarImagen = () => {
  imagen.value = null;
  preview.value = null;
};

const abrirConfirmacion = (id: number) => {
  productoAEliminar.value = id;
  openDeleteModal.value = true;
};

const cerrarConfirmacion = () => {
  productoAEliminar.value = null;
  openDeleteModal.value = false;
};

const confirmarEliminacion = () => {
  if (!productoAEliminar.value) return;

  productos.value = productos.value.filter((p) => p.id !== productoAEliminar.value);
  cerrarConfirmacion();
};

const darDeBaja = (id: number) => {
  const producto = productos.value.find((p) => p.id === id);
  if (producto) producto.activo = false;
};

const restaurar = (id: number) => {
  const producto = productos.value.find((p) => p.id === id);
  if (producto) producto.activo = true;
};
</script>
