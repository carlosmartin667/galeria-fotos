export interface Evento {
  id: string;
  nombre: string;
  descripcion?: string;
  fechaEventoUtc: string;
  estado?: string;
  visibilidad?: string;
  fechaLimiteCompraUtc?: string;
  activo?: boolean;
  portadaFotoId?: string;
  portadaPreviewUrl?: string;
  portadaUrl?: string;
  portadaFotoPreviewUrl?: string;
  clientePrincipalId?: string;
}

export interface CrearEventoRequest {
  nombre: string;
  descripcion?: string;
  fechaEventoUtc: string;
  estado?: string;
  visibilidad?: string;
  fechaLimiteCompraUtc?: string;
  clientePrincipalId?: string;
}

export interface ActualizarEventoRequest {
  nombre: string;
  descripcion?: string;
  fechaEventoUtc: string;
  estado: string;
  visibilidad?: string;
  fechaLimiteCompraUtc?: string;
  activo: boolean;
  clientePrincipalId?: string;
}
