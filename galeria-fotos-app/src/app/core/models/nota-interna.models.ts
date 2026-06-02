export interface NotaInterna {
  id?: string;
  entidadTipo?: string | null;
  entidadId?: string | null;
  texto: string;
  activa?: boolean;
  autorId?: string | null;
  autorNombre?: string | null;
  usuarioNombre?: string | null;
  fechaCreacionUtc?: string | null;
  fechaActualizacionUtc?: string | null;
}

export interface CrearNotaInternaRequest {
  texto: string;
}

export interface ActualizarNotaInternaRequest {
  texto: string;
  activa: boolean;
}
