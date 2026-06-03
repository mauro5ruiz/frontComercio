export interface DashboardCardsDto {
  ventasMesActual: number;
  ventasMesAnterior: number;
  devolucionesVentasMesActual: number;
  devolucionesVentasMesAnterior: number;
  comprasMesActual: number;
  comprasMesAnterior: number;
  devolucionesComprasMesActual: number;
  devolucionesComprasMesAnterior: number;
  perdidasMesActual: number;
  perdidasMesAnterior: number;
}

export interface DashboardModulosDto {
  productos: number;
  categorias: number;
  marcas: number;
  ofertasActivas: number;
  perdidas: number;
  ventas: number;
  devolucionesVentas: number;
  compras: number;
  devolucionesCompras: number;
  clientes: number;
  proveedores: number;
  vendedores: number;
}

export interface DashboardAlertasDto {
  productosBajoStock: number;
  ofertasPorVencer: number;
  perdidasPendientes: number;
}

export interface DashboardResumenOperativoDto {
  productosActivos: number;
  productosInactivos: number;
  clientesActivos: number;
  proveedoresActivos: number;
  vendedoresActivos: number;
  ofertasActivas: number;
}

export interface DashboardUltimaVentaDto {
  id: number;
  fecha: string;
  cliente: string;
  vendedor: string;
  total: number;
  estado: string;
}

export interface DashboardDto {
  cards: DashboardCardsDto;
  modulos: DashboardModulosDto;
  alertas: DashboardAlertasDto;
  resumenOperativo: DashboardResumenOperativoDto;
  ultimasVentas: DashboardUltimaVentaDto[];
}
