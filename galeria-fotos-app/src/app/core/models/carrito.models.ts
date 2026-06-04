import { CuponAplicado } from './cupon.models';
import { Pedido } from './pedido.models';

export interface CarritoItem {
  id: string;
  itemId?: string | null;
  tipo?: string | null;
  tipoItem?: string | null;
  nombre?: string | null;
  descripcion?: string | null;
  fotoId?: string | null;
  fotoPrivadaId?: string | null;
  paqueteId?: string | null;
  eventoId?: string | null;
  eventoNombre?: string | null;
  previewUrl?: string | null;
  cantidad?: number | null;
  precioUnitario?: number | null;
  subtotal?: number | null;
  descuento?: number | null;
  descuentoTotal?: number | null;
  total?: number | null;
  totalFinal?: number | null;
  moneda?: string | null;
  fechaCreacionUtc?: string | null;
}

export interface Carrito {
  id?: string | null;
  clienteId?: string | null;
  usuarioId?: string | null;
  items?: CarritoItem[] | null;
  subtotal?: number | null;
  descuentoTotal?: number | null;
  total?: number | null;
  totalFinal?: number | null;
  moneda?: string | null;
  cuponCodigo?: string | null;
  cuponAplicado?: CuponAplicado | null;
  fechaActualizacionUtc?: string | null;
  fechaCreacionUtc?: string | null;
}

export interface CrearPedidoDesdeCarritoResponse {
  pedido?: Pedido | null;
  pedidoId?: string | null;
  id?: string | null;
  mensaje?: string | null;
}

export type { AplicarCuponCarritoRequest, CuponAplicado } from './cupon.models';
