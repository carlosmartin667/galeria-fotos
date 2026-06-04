export interface ServicioFotografia {
  id?: string;
  nombre: string;
  descripcion?: string | null;
  precioDesde?: number | null;
  duracionEstimada?: string | null;
  cantidadFotosIncluidas?: number | null;
  imagenUrl?: string | null;
  activo?: boolean;
  orden?: number;
  fechaCreacionUtc?: string;
  fechaActualizacionUtc?: string | null;
}

export interface CrearServicioFotografiaRequest {
  nombre: string;
  descripcion?: string | null;
  precioDesde?: number | null;
  duracionEstimada?: string | null;
  cantidadFotosIncluidas?: number | null;
  imagenUrl?: string | null;
  activo: boolean;
  orden: number;
}

export interface ActualizarServicioFotografiaRequest extends CrearServicioFotografiaRequest {}
