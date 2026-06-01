export interface Pedido {
  id: string;
  eventoId: string;
  clienteId: string;
  fotoIds?: string[];
  fotoPrivadaIds?: string[];
  estado?: string;
  total?: number;
  moneda?: string;
  fechaCreacionUtc?: string;
}

export interface CrearPedidoRequest {
  eventoId: string;
  clienteId: string;
  fotoIds?: string[];
}
