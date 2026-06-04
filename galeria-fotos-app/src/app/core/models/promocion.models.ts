export interface Promocion {
  id: string;
  titulo?: string | null;
  descripcion?: string | null;
  imagenUrl?: string | null;
  tipo?: string | null;
  fechaInicioUtc?: string | null;
  fechaFinUtc?: string | null;
  activa?: boolean;
  destacado?: boolean;
  destacada?: boolean;
  orden?: number | null;
  cuponDescuentoId?: string | null;
  cuponCodigo?: string | null;
  codigoCupon?: string | null;
  servicioFotografiaId?: string | null;
  servicioNombre?: string | null;
  eventoId?: string | null;
  eventoNombre?: string | null;
  fechaCreacionUtc?: string | null;
  fechaActualizacionUtc?: string | null;
}

export interface CrearPromocionRequest {
  titulo: string;
  descripcion?: string | null;
  imagenUrl?: string | null;
  tipo: string;
  fechaInicioUtc?: string | null;
  fechaFinUtc?: string | null;
  activa: boolean;
  destacada: boolean;
  orden: number;
  cuponDescuentoId?: string | null;
  servicioFotografiaId?: string | null;
  eventoId?: string | null;
}

export type ActualizarPromocionRequest = CrearPromocionRequest;
