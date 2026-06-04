export interface Pedido {
  id: string;
  eventoId: string;
  clienteId: string;
  fotoIds?: string[];
  fotoPrivadaIds?: string[];
  estado?: string;
  subtotal?: number | null;
  descuentoTotal?: number | null;
  total?: number;
  totalFinal?: number | null;
  moneda?: string;
  cuponCodigo?: string | null;
  cuponAplicado?: string | {
    codigo?: string | null;
    descripcion?: string | null;
    descuentoAplicado?: number | null;
    descuentoTotal?: number | null;
  } | null;
  fechaCreacionUtc?: string;
}

export interface CrearPedidoRequest {
  eventoId: string;
  clienteId: string;
  fotoIds?: string[];
}

export interface CambiarEstadoPedidoRequest {
  estado: string;
  comentario?: string | null;
}

export interface PedidoEstadoHistorial {
  id?: string;
  pedidoId?: string;
  estadoAnterior?: string | null;
  estadoNuevo?: string | null;
  comentario?: string | null;
  usuarioId?: string | null;
  usuarioNombre?: string | null;
  usuarioEmail?: string | null;
  fechaCambioUtc?: string | null;
  fechaCreacionUtc?: string | null;
}
