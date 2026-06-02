export interface Testimonio {
  id: string;
  nombreCliente?: string | null;
  emailCliente?: string | null;
  texto?: string | null;
  calificacion?: number | null;
  imagenUrl?: string | null;
  publicado?: boolean;
  destacada?: boolean;
  destacado?: boolean;
  activo?: boolean;
  clienteId?: string | null;
  pedidoId?: string | null;
  servicioFotografiaId?: string | null;
  eventoId?: string | null;
  fechaPublicacionUtc?: string | null;
  fechaCreacionUtc?: string | null;
  fechaActualizacionUtc?: string | null;
}

export interface CrearTestimonioRequest {
  nombreCliente: string;
  emailCliente?: string | null;
  texto: string;
  calificacion: number;
  imagenUrl?: string | null;
  clienteId?: string | null;
  pedidoId?: string | null;
  servicioFotografiaId?: string | null;
  eventoId?: string | null;
}

export interface ActualizarTestimonioAdminRequest extends CrearTestimonioRequest {
  publicado: boolean;
  destacado: boolean;
  activo: boolean;
}
