import api from "@/plugins/axios";
import type { DashboardDto } from "./types";

export async function obtenerDashboard() {
  const { data } = await api.get("/dashboard");
  return normalizarDashboard(data);
}

function normalizarDashboard(payload: any): DashboardDto {
  const cards = payload.cards ?? payload.Cards ?? {};
  const modulos = payload.modulos ?? payload.Modulos ?? {};
  const alertas = payload.alertas ?? payload.Alertas ?? {};
  const resumenOperativo = payload.resumenOperativo ?? payload.ResumenOperativo ?? {};
  const ultimasVentas = payload.ultimasVentas ?? payload.UltimasVentas ?? [];

  return {
    cards: {
      ventasMesActual: cards.ventasMesActual ?? cards.VentasMesActual ?? 0,
      ventasMesAnterior: cards.ventasMesAnterior ?? cards.VentasMesAnterior ?? 0,
      devolucionesVentasMesActual: cards.devolucionesVentasMesActual ?? cards.DevolucionesVentasMesActual ?? 0,
      devolucionesVentasMesAnterior: cards.devolucionesVentasMesAnterior ?? cards.DevolucionesVentasMesAnterior ?? 0,
      comprasMesActual: cards.comprasMesActual ?? cards.ComprasMesActual ?? 0,
      comprasMesAnterior: cards.comprasMesAnterior ?? cards.ComprasMesAnterior ?? 0,
      devolucionesComprasMesActual: cards.devolucionesComprasMesActual ?? cards.DevolucionesComprasMesActual ?? 0,
      devolucionesComprasMesAnterior: cards.devolucionesComprasMesAnterior ?? cards.DevolucionesComprasMesAnterior ?? 0,
      perdidasMesActual: cards.perdidasMesActual ?? cards.PerdidasMesActual ?? 0,
      perdidasMesAnterior: cards.perdidasMesAnterior ?? cards.PerdidasMesAnterior ?? 0,
    },
    modulos: {
      productos: modulos.productos ?? modulos.Productos ?? 0,
      categorias: modulos.categorias ?? modulos.Categorias ?? 0,
      marcas: modulos.marcas ?? modulos.Marcas ?? 0,
      ofertasActivas: modulos.ofertasActivas ?? modulos.OfertasActivas ?? 0,
      perdidas: modulos.perdidas ?? modulos.Perdidas ?? 0,
      ventas: modulos.ventas ?? modulos.Ventas ?? 0,
      devolucionesVentas: modulos.devolucionesVentas ?? modulos.DevolucionesVentas ?? 0,
      compras: modulos.compras ?? modulos.Compras ?? 0,
      devolucionesCompras: modulos.devolucionesCompras ?? modulos.DevolucionesCompras ?? 0,
      clientes: modulos.clientes ?? modulos.Clientes ?? 0,
      proveedores: modulos.proveedores ?? modulos.Proveedores ?? 0,
      vendedores: modulos.vendedores ?? modulos.Vendedores ?? 0,
    },
    alertas: {
      productosBajoStock: alertas.productosBajoStock ?? alertas.ProductosBajoStock ?? 0,
      ofertasPorVencer: alertas.ofertasPorVencer ?? alertas.OfertasPorVencer ?? 0,
      perdidasPendientes: alertas.perdidasPendientes ?? alertas.PerdidasPendientes ?? 0,
    },
    resumenOperativo: {
      productosActivos: resumenOperativo.productosActivos ?? resumenOperativo.ProductosActivos ?? 0,
      productosInactivos: resumenOperativo.productosInactivos ?? resumenOperativo.ProductosInactivos ?? 0,
      clientesActivos: resumenOperativo.clientesActivos ?? resumenOperativo.ClientesActivos ?? 0,
      proveedoresActivos: resumenOperativo.proveedoresActivos ?? resumenOperativo.ProveedoresActivos ?? 0,
      vendedoresActivos: resumenOperativo.vendedoresActivos ?? resumenOperativo.VendedoresActivos ?? 0,
      ofertasActivas: resumenOperativo.ofertasActivas ?? resumenOperativo.OfertasActivas ?? 0,
    },
    ultimasVentas: ultimasVentas.map((venta: any) => ({
      id: venta.id ?? venta.Id ?? 0,
      fecha: venta.fecha ?? venta.Fecha ?? "",
      cliente: venta.cliente ?? venta.Cliente ?? "",
      vendedor: venta.vendedor ?? venta.Vendedor ?? "",
      total: venta.total ?? venta.Total ?? 0,
      estado: venta.estado ?? venta.Estado ?? "",
    })),
  };
}
