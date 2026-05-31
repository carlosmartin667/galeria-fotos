export interface Evento {
  id: string;
  nombre: string;
  descripcion?: string;
  fechaEventoUtc: string;
  estado?: string;
  clientePrincipalId?: string;
}

export interface CrearEventoRequest {
  nombre: string;
  descripcion?: string;
  fechaEventoUtc: string;
  clientePrincipalId?: string;
}

export interface ActualizarEventoRequest {
  nombre: string;
  descripcion?: string;
  fechaEventoUtc: string;
  estado: string;
  clientePrincipalId?: string;
}
