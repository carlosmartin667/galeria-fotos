export interface VentaPorDia {
  fecha?: string | null;
  fechaUtc?: string | null;
  totalPedidos?: number | null;
  cantidadPedidos?: number | null;
  totalVentas?: number | null;
  totalDescuentos?: number | null;
}

export interface VentaPorEstado {
  estado?: string | null;
  cantidad?: number | null;
  total?: number | null;
}

export interface VentaPorTipoItem {
  tipo?: string | null;
  tipoItem?: string | null;
  cantidad?: number | null;
  total?: number | null;
}

export interface TopProducto {
  id?: string | null;
  productoId?: string | null;
  nombre?: string | null;
  titulo?: string | null;
  cantidad?: number | null;
  total?: number | null;
  ingresos?: number | null;
}

export interface CuponMasUsado {
  cuponId?: string | null;
  codigo?: string | null;
  usos?: number | null;
  cantidadUsos?: number | null;
  descuentoTotal?: number | null;
}

export interface ReporteVentasResumen {
  totalPedidos?: number | null;
  totalVentas?: number | null;
  totalDescuentos?: number | null;
  ticketPromedio?: number | null;
  pedidosPagados?: number | null;
  pedidosPendientes?: number | null;
  pedidosCancelados?: number | null;
  ventasPorDia?: VentaPorDia[] | null;
  ventasPorEstado?: VentaPorEstado[] | null;
  ventasPorTipoItem?: VentaPorTipoItem[] | null;
  topEventos?: TopProducto[] | null;
  topFotos?: TopProducto[] | null;
  topPaquetes?: TopProducto[] | null;
  cuponesMasUsados?: CuponMasUsado[] | null;
}

export interface AdminVentasResumen {
  ventasMes?: number | null;
  ventasMesAnterior?: number | null;
  crecimientoPorcentual?: number | null;
  carritosAbandonados?: number | null;
  carritosRecuperados?: number | null;
  cuponesActivos?: number | null;
  promocionesActivas?: number | null;
  testimoniosPendientes?: number | null;
  productosMasVendidos?: TopProducto[] | null;
  fotosMasVendidas?: TopProducto[] | null;
  paquetesMasVendidos?: TopProducto[] | null;
  eventosMasVendidos?: TopProducto[] | null;
}
