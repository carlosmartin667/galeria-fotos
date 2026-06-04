export interface CuponDescuento {
  id: string;
  codigo?: string | null;
  descripcion?: string | null;
  tipoDescuento?: string | null;
  valorDescuento?: number | null;
  montoMinimoCompra?: number | null;
  montoMaximoDescuento?: number | null;
  fechaInicioUtc?: string | null;
  fechaFinUtc?: string | null;
  usosMaximos?: number | null;
  usosMaximosPorUsuario?: number | null;
  usosActuales?: number | null;
  usosRealizados?: number | null;
  soloPrimerCompra?: boolean;
  activo?: boolean;
  fechaCreacionUtc?: string | null;
  fechaActualizacionUtc?: string | null;
}

export interface CuponUso {
  id?: string;
  cuponDescuentoId?: string | null;
  cuponCodigo?: string | null;
  pedidoId?: string | null;
  clienteId?: string | null;
  clienteNombre?: string | null;
  clienteEmail?: string | null;
  subtotal?: number | null;
  descuentoAplicado?: number | null;
  totalFinal?: number | null;
  fechaUsoUtc?: string | null;
  fechaCreacionUtc?: string | null;
}

export interface CrearCuponDescuentoRequest {
  codigo: string;
  descripcion?: string | null;
  tipoDescuento: string;
  valorDescuento: number;
  montoMinimoCompra?: number | null;
  montoMaximoDescuento?: number | null;
  fechaInicioUtc?: string | null;
  fechaFinUtc?: string | null;
  usosMaximos?: number | null;
  usosMaximosPorUsuario?: number | null;
  soloPrimerCompra: boolean;
  activo: boolean;
}

export interface ActualizarCuponDescuentoRequest {
  descripcion?: string | null;
  tipoDescuento: string;
  valorDescuento: number;
  montoMinimoCompra?: number | null;
  montoMaximoDescuento?: number | null;
  fechaInicioUtc?: string | null;
  fechaFinUtc?: string | null;
  usosMaximos?: number | null;
  usosMaximosPorUsuario?: number | null;
  soloPrimerCompra: boolean;
  activo: boolean;
}

export interface ValidarCuponRequest {
  codigo: string;
  subtotal?: number | null;
}

export interface ValidarCuponResponse {
  valido?: boolean;
  valid?: boolean;
  codigo?: string | null;
  mensaje?: string | null;
  descuento?: number | null;
  descuentoTotal?: number | null;
  subtotal?: number | null;
  totalFinal?: number | null;
  cupon?: CuponDescuento | null;
}

export interface AplicarCuponCarritoRequest {
  codigo: string;
}

export interface CuponAplicado {
  id?: string | null;
  codigo?: string | null;
  descripcion?: string | null;
  tipoDescuento?: string | null;
  valorDescuento?: number | null;
  descuentoAplicado?: number | null;
  descuentoTotal?: number | null;
}
