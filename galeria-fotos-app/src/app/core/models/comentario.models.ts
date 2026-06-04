export interface ComentarioRequest {
  texto: string;
}

export interface ComentarioResponse {
  id: string;
  texto: string;
  usuarioId: string;
  nombreUsuario?: string;
  fechaCreacionUtc: string;
  fechaActualizacionUtc?: string;
  activo: boolean;
}
