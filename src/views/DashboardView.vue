<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
      <p class="text-sm text-gray-500">Resumen general del sistema</p>
    </div>

    <div
      v-if="loadingGeneral"
      class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm"
    >
      Cargando resumen del sistema...
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      <div
        v-for="card in cardsResumen"
        :key="card.titulo"
        class="rounded-xl border border-gray-100 bg-white p-5 shadow"
      >
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm text-gray-500">{{ card.titulo }}</p>
            <h2 class="mt-1 text-2xl font-bold text-gray-800">{{ card.valor }}</h2>
          </div>
          <div class="text-3xl">{{ card.icono }}</div>
        </div>

        <p class="mt-3 text-xs" :class="card.colorClase">
          {{ card.variacion }}
        </p>
      </div>
    </div>

    <div>
      <h2 class="mb-3 text-lg font-bold text-gray-800">Modulos</h2>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <div
          v-for="modulo in modulos"
          :key="modulo.nombre"
          class="rounded-xl border border-gray-100 bg-white p-4 shadow transition hover:shadow-md"
        >
          <div class="mb-3 flex items-center justify-between">
            <span class="text-2xl">{{ modulo.icono }}</span>
            <span class="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
              {{ modulo.cantidad }}
            </span>
          </div>

          <h3 class="font-semibold text-gray-800">{{ modulo.nombre }}</h3>
          <p class="mt-1 text-sm text-gray-500">{{ modulo.descripcion }}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div class="rounded-xl border border-gray-100 bg-white shadow xl:col-span-2">
        <div class="border-b p-4">
          <h2 class="font-bold text-gray-800">Ultimas ventas</h2>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b text-left text-gray-500">
                <th class="p-3">Fecha</th>
                <th class="p-3">Cliente</th>
                <th class="p-3">Vendedor</th>
                <th class="p-3">Total</th>
                <th class="p-3">Estado</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="venta in dashboard?.ultimasVentas ?? []"
                :key="venta.id"
                class="border-b hover:bg-gray-50"
              >
                <td class="p-3">{{ formatDate(venta.fecha) }}</td>
                <td class="p-3">{{ venta.cliente }}</td>
                <td class="p-3">{{ venta.vendedor }}</td>
                <td class="p-3 font-semibold">{{ money(venta.total) }}</td>
                <td class="p-3">
                  <span
                    class="rounded-full px-2 py-1 text-xs font-medium"
                    :class="estadoVentaClase(venta.estado)"
                  >
                    {{ venta.estado }}
                  </span>
                </td>
              </tr>
              <tr v-if="!(dashboard?.ultimasVentas?.length)">
                <td colspan="5" class="p-4 text-center text-gray-400">No hay ventas recientes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="rounded-xl border border-gray-100 bg-white shadow">
        <div class="border-b p-4">
          <h2 class="font-bold text-gray-800">Alertas</h2>
        </div>

        <div class="space-y-3 p-4">
          <div
            v-for="alerta in alertas"
            :key="alerta.texto"
            class="flex items-start gap-3 rounded-lg bg-gray-50 p-3"
          >
            <span class="text-xl">{{ alerta.icono }}</span>
            <div>
              <p class="text-sm font-medium text-gray-800">{{ alerta.texto }}</p>
              <p class="text-xs text-gray-500">{{ alerta.detalle }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-gray-100 bg-white shadow">
      <div class="border-b p-4">
        <h2 class="font-bold text-gray-800">Resumen operativo</h2>
      </div>

      <div class="grid grid-cols-1 gap-4 p-4 md:grid-cols-3 lg:grid-cols-6">
        <div
          v-for="item in resumenOperativo"
          :key="item.label"
          class="rounded-lg border p-4 text-center"
        >
          <p class="text-2xl font-bold text-gray-800">{{ item.valor }}</p>
          <p class="mt-1 text-xs text-gray-500">{{ item.label }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { obtenerDashboard } from "@/modules/dashboard/services";
import type { DashboardDto } from "@/modules/dashboard/types";
import { useNotificationStore } from "@/stores/notificaciones";

const notification = useNotificationStore();

const dashboard = ref<DashboardDto | null>(null);
const loadingGeneral = ref(false);

const cardsResumen = computed(() => {
  const cards = dashboard.value?.cards;
  if (!cards) return [];

  return [
    {
      titulo: "Ventas del mes",
      valor: money(cards.ventasMesActual),
      icono: "💰",
      variacion: textoVariacion(cards.ventasMesActual, cards.ventasMesAnterior, "respecto al mes anterior"),
      colorClase: colorVariacion(cards.ventasMesActual, cards.ventasMesAnterior),
    },
    {
      titulo: "Devoluciones de ventas",
      valor: money(cards.devolucionesVentasMesActual),
      icono: "↩️",
      variacion: textoVariacion(
        cards.devolucionesVentasMesActual,
        cards.devolucionesVentasMesAnterior,
        "respecto al mes anterior",
      ),
      colorClase: colorVariacionInvertida(
        cards.devolucionesVentasMesActual,
        cards.devolucionesVentasMesAnterior,
      ),
    },
    {
      titulo: "Compras del mes",
      valor: money(cards.comprasMesActual),
      icono: "🛒",
      variacion: textoVariacion(cards.comprasMesActual, cards.comprasMesAnterior, "respecto al mes anterior"),
      colorClase: colorVariacion(cards.comprasMesActual, cards.comprasMesAnterior),
    },
    {
      titulo: "Devoluciones de compras",
      valor: money(cards.devolucionesComprasMesActual),
      icono: "📦",
      variacion: textoVariacion(
        cards.devolucionesComprasMesActual,
        cards.devolucionesComprasMesAnterior,
        "respecto al mes anterior",
      ),
      colorClase: colorVariacionInvertida(
        cards.devolucionesComprasMesActual,
        cards.devolucionesComprasMesAnterior,
      ),
    },
    {
      titulo: "Perdidas registradas",
      valor: money(cards.perdidasMesActual),
      icono: "⚠️",
      variacion: textoVariacion(cards.perdidasMesActual, cards.perdidasMesAnterior, "respecto al mes anterior"),
      colorClase: colorVariacionInvertida(cards.perdidasMesActual, cards.perdidasMesAnterior),
    },
  ];
});

const modulos = computed(() => {
  const modulosApi = dashboard.value?.modulos;
  if (!modulosApi) return [];

  return [
    { nombre: "Productos", cantidad: modulosApi.productos, icono: "📦", descripcion: "Stock y detalle de productos" },
    { nombre: "Categorias", cantidad: modulosApi.categorias, icono: "🏷️", descripcion: "Agrupacion de productos" },
    { nombre: "Marcas", cantidad: modulosApi.marcas, icono: "🔖", descripcion: "Marcas disponibles" },
    { nombre: "Ofertas", cantidad: modulosApi.ofertasActivas, icono: "🔥", descripcion: "Promociones activas" },
    { nombre: "Perdidas", cantidad: modulosApi.perdidas, icono: "⚠️", descripcion: "Registros de perdidas" },
    { nombre: "Ventas", cantidad: modulosApi.ventas, icono: "💵", descripcion: "Ventas registradas" },
    { nombre: "Dev. ventas", cantidad: modulosApi.devolucionesVentas, icono: "↩️", descripcion: "Devoluciones de ventas" },
    { nombre: "Compras", cantidad: modulosApi.compras, icono: "🛒", descripcion: "Compras a proveedores" },
    { nombre: "Dev. compras", cantidad: modulosApi.devolucionesCompras, icono: "📥", descripcion: "Devoluciones a proveedores" },
    { nombre: "Clientes", cantidad: modulosApi.clientes, icono: "👥", descripcion: "Clientes registrados" },
    { nombre: "Proveedores", cantidad: modulosApi.proveedores, icono: "🚚", descripcion: "Proveedores cargados" },
    { nombre: "Vendedores", cantidad: modulosApi.vendedores, icono: "🧑‍💼", descripcion: "Vendedores del sistema" },
  ];
});

const alertas = computed(() => {
  const alertasApi = dashboard.value?.alertas;
  if (!alertasApi) return [];

  return [
    {
      icono: "📦",
      texto: `${alertasApi.productosBajoStock} productos con bajo stock`,
      detalle: alertasApi.productosBajoStock
        ? "Revisar reposicion de mercaderia."
        : "No hay alertas de stock por debajo del minimo.",
    },
    {
      icono: "🔥",
      texto: `${alertasApi.ofertasPorVencer} ofertas por vencer`,
      detalle: alertasApi.ofertasPorVencer
        ? "Conviene revisar fechas o renovar promociones."
        : "No hay ofertas por vencer en los proximos 7 dias.",
    },
    {
      icono: "⚠️",
      texto: `${alertasApi.perdidasPendientes} perdidas pendientes`,
      detalle: alertasApi.perdidasPendientes
        ? "Esperan revision o aprobacion administrativa."
        : "No hay perdidas pendientes.",
    },
  ];
});

const resumenOperativo = computed(() => {
  const resumen = dashboard.value?.resumenOperativo;
  if (!resumen) return [];

  return [
    { label: "Productos activos", valor: resumen.productosActivos },
    { label: "Productos inactivos", valor: resumen.productosInactivos },
    { label: "Clientes activos", valor: resumen.clientesActivos },
    { label: "Proveedores activos", valor: resumen.proveedoresActivos },
    { label: "Vendedores activos", valor: resumen.vendedoresActivos },
    { label: "Ofertas activas", valor: resumen.ofertasActivas },
  ];
});

function parseApiDate(value: string) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year || 0, (month || 1) - 1, day || 1);
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: string) {
  const date = parseApiDate(value);
  return date ? date.toLocaleDateString("es-AR") : "-";
}

function money(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(value || 0);
}

function porcentajeVariacion(actual: number, anterior: number) {
  if (anterior === 0) {
    if (actual === 0) return 0;
    return 100;
  }

  return ((actual - anterior) / anterior) * 100;
}

function textoVariacion(actual: number, anterior: number, sufijo: string) {
  if (anterior === 0 && actual === 0) return `Sin cambios ${sufijo}`;
  if (anterior === 0) return `Nuevo movimiento ${sufijo}`;

  const variacion = porcentajeVariacion(actual, anterior);
  const signo = variacion > 0 ? "+" : "";
  return `${signo}${variacion.toFixed(1)}% ${sufijo}`;
}

function colorVariacion(actual: number, anterior: number) {
  if (actual === anterior) return "text-slate-500";
  return actual >= anterior ? "text-green-600" : "text-red-500";
}

function colorVariacionInvertida(actual: number, anterior: number) {
  if (actual === anterior) return "text-slate-500";
  return actual <= anterior ? "text-green-600" : "text-red-500";
}

function estadoVentaClase(estado: string) {
  const normalizado = estado.trim().toLowerCase();
  if (normalizado === "anulada") return "bg-red-100 text-red-700";
  if (normalizado === "pendiente") return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
}

async function cargarDashboard() {
  loadingGeneral.value = true;

  try {
    dashboard.value = await obtenerDashboard();
  } catch (err: any) {
    const message =
      err.response?.data?.error ||
      err.response?.data?.Error ||
      "No se pudo cargar el dashboard";
    notification.show(message, "error");
  } finally {
    loadingGeneral.value = false;
  }
}

onMounted(async () => {
  await cargarDashboard();
});
</script>
