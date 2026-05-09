<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
      <p class="text-sm text-gray-500">Resumen general del sistema</p>
    </div>

    <!-- CARDS PRINCIPALES -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <div
        v-for="card in cardsResumen"
        :key="card.titulo"
        class="bg-white rounded-xl shadow p-5 border border-gray-100"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">{{ card.titulo }}</p>
            <h2 class="text-2xl font-bold text-gray-800 mt-1">
              {{ card.valor }}
            </h2>
          </div>

          <div class="text-3xl">
            {{ card.icono }}
          </div>
        </div>

        <p
          class="text-xs mt-3"
          :class="card.positivo ? 'text-green-600' : 'text-red-500'"
        >
          {{ card.variacion }}
        </p>
      </div>
    </div>

    <!-- MODULOS -->
    <div>
      <h2 class="text-lg font-bold text-gray-800 mb-3">Módulos</h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="modulo in modulos"
          :key="modulo.nombre"
          class="bg-white rounded-xl shadow p-4 border border-gray-100 hover:shadow-md transition"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-2xl">{{ modulo.icono }}</span>
            <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {{ modulo.cantidad }}
            </span>
          </div>

          <h3 class="font-semibold text-gray-800">{{ modulo.nombre }}</h3>
          <p class="text-sm text-gray-500 mt-1">{{ modulo.descripcion }}</p>
        </div>
      </div>
    </div>

    <!-- BLOQUE INFERIOR -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- ULTIMAS VENTAS -->
      <div class="xl:col-span-2 bg-white rounded-xl shadow border border-gray-100">
        <div class="p-4 border-b">
          <h2 class="font-bold text-gray-800">Últimas ventas</h2>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-gray-500 border-b">
                <th class="p-3">Cliente</th>
                <th class="p-3">Vendedor</th>
                <th class="p-3">Total</th>
                <th class="p-3">Estado</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="venta in ultimasVentas"
                :key="venta.id"
                class="border-b hover:bg-gray-50"
              >
                <td class="p-3">{{ venta.cliente }}</td>
                <td class="p-3">{{ venta.vendedor }}</td>
                <td class="p-3 font-semibold">${{ venta.total }}</td>
                <td class="p-3">
                  <span
                    class="px-2 py-1 rounded-full text-xs font-medium"
                    :class="venta.estado === 'Finalizada'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'"
                  >
                    {{ venta.estado }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ALERTAS -->
      <div class="bg-white rounded-xl shadow border border-gray-100">
        <div class="p-4 border-b">
          <h2 class="font-bold text-gray-800">Alertas</h2>
        </div>

        <div class="p-4 space-y-3">
          <div
            v-for="alerta in alertas"
            :key="alerta.texto"
            class="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
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

    <!-- RESUMEN POR MODULO -->
    <div class="bg-white rounded-xl shadow border border-gray-100">
      <div class="p-4 border-b">
        <h2 class="font-bold text-gray-800">Resumen operativo</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4">
        <div
          v-for="item in resumenOperativo"
          :key="item.label"
          class="text-center border rounded-lg p-4"
        >
          <p class="text-2xl font-bold text-gray-800">{{ item.valor }}</p>
          <p class="text-xs text-gray-500 mt-1">{{ item.label }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const cardsResumen = [
  {
    titulo: "Ventas del mes",
    valor: "$1.245.800",
    icono: "💰",
    variacion: "+18% respecto al mes anterior",
    positivo: true,
  },
  {
    titulo: "Compras del mes",
    valor: "$734.200",
    icono: "🛒",
    variacion: "+9% respecto al mes anterior",
    positivo: true,
  },
  {
    titulo: "Pérdidas registradas",
    valor: "$42.500",
    icono: "⚠️",
    variacion: "-4% respecto al mes anterior",
    positivo: true,
  },
  {
    titulo: "Devoluciones",
    valor: "18",
    icono: "↩️",
    variacion: "+3 esta semana",
    positivo: false,
  },
];

const modulos = [
  {
    nombre: "Productos",
    cantidad: 245,
    icono: "📦",
    descripcion: "Stock y detalle de productos",
  },
  {
    nombre: "Categorías",
    cantidad: 18,
    icono: "🏷️",
    descripcion: "Agrupación de productos",
  },
  {
    nombre: "Marcas",
    cantidad: 34,
    icono: "🔖",
    descripcion: "Marcas disponibles",
  },
  {
    nombre: "Ofertas",
    cantidad: 12,
    icono: "🔥",
    descripcion: "Promociones activas",
  },
  {
    nombre: "Pérdidas",
    cantidad: 7,
    icono: "⚠️",
    descripcion: "Productos dañados o faltantes",
  },
  {
    nombre: "Ventas",
    cantidad: 128,
    icono: "💵",
    descripcion: "Ventas registradas",
  },
  {
    nombre: "Compras",
    cantidad: 64,
    icono: "🛒",
    descripcion: "Compras a proveedores",
  },
  {
    nombre: "Devoluciones",
    cantidad: 18,
    icono: "↩️",
    descripcion: "Devoluciones procesadas",
  },
  {
    nombre: "Clientes",
    cantidad: 312,
    icono: "👥",
    descripcion: "Clientes registrados",
  },
  {
    nombre: "Proveedores",
    cantidad: 26,
    icono: "🚚",
    descripcion: "Proveedores activos",
  },
  {
    nombre: "Vendedores",
    cantidad: 9,
    icono: "🧑‍💼",
    descripcion: "Vendedores del sistema",
  },
];

const ultimasVentas = [
  {
    id: 1,
    cliente: "Juan Pérez",
    vendedor: "María Gómez",
    total: "45.200",
    estado: "Finalizada",
  },
  {
    id: 2,
    cliente: "Carlos López",
    vendedor: "Ana Torres",
    total: "18.900",
    estado: "Pendiente",
  },
  {
    id: 3,
    cliente: "Lucía Fernández",
    vendedor: "Pedro Ruiz",
    total: "72.300",
    estado: "Finalizada",
  },
  {
    id: 4,
    cliente: "Martín Silva",
    vendedor: "María Gómez",
    total: "11.500",
    estado: "Finalizada",
  },
];

const alertas = [
  {
    icono: "📦",
    texto: "8 productos con bajo stock",
    detalle: "Revisar reposición de mercadería.",
  },
  {
    icono: "🔥",
    texto: "3 ofertas vencen esta semana",
    detalle: "Actualizar fechas o desactivar.",
  },
  {
    icono: "↩️",
    texto: "5 devoluciones pendientes",
    detalle: "Esperando revisión administrativa.",
  },
  {
    icono: "⚠️",
    texto: "2 pérdidas sin justificar",
    detalle: "Pendientes de validación.",
  },
];

const resumenOperativo = [
  { label: "Productos activos", valor: 231 },
  { label: "Productos inactivos", valor: 14 },
  { label: "Clientes activos", valor: 287 },
  { label: "Proveedores", valor: 26 },
  { label: "Vendedores activos", valor: 8 },
  { label: "Ofertas activas", valor: 12 },
];
</script>