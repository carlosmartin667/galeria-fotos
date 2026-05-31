export interface Pedido {
  id: string;
  eventoId: string;
  clienteId: string;
  fotoIds?: string[];
  estado?: string;
  total?: number;
  fechaCreacionUtc?: string;
}

export interface CrearPedidoRequest {
  eventoId: string;
  clienteId: string;
  fotoIds?: string[];
}
