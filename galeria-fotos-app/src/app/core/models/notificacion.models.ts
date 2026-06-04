export interface Notificacion {
  id: string;
  tipo?: string | null;
  canal?: string | null;
  estado?: string | null;
  titulo?: string | null;
  mensaje?: string | null;
  destinatarioEmail?: string | null;
  usuarioId?: string | null;
  entidadTipo?: string | null;
  entidadId?: string | null;
  correlationKey?: string | null;
  intentos?: number;
  maxIntentos?: number;
  error?: string | null;
  leida?: boolean;
  fechaLecturaUtc?: string | null;
  programadaParaUtc?: string | null;
  enviadaEnUtc?: string | null;
  fechaCreacionUtc?: string;
  fechaActualizacionUtc?: string | null;
  activa?: boolean;
}

export interface NotificacionesAdminQuery {
  estado?: string | null;
  canal?: string | null;
  tipo?: string | null;
  activa?: boolean | null;
  take?: number | null;
}

export interface PlantillaNotificacion {
  id: string;
  codigo?: string | null;
  canal?: string | null;
  asunto?: string | null;
  cuerpoHtml?: string | null;
  cuerpoTexto?: string | null;
  activa?: boolean;
  fechaCreacionUtc?: string;
  fechaActualizacionUtc?: string | null;
}

export interface CrearPlantillaNotificacionRequest {
  codigo: string;
  canal: string;
  asunto: string;
  cuerpoHtml: string;
  cuerpoTexto?: string | null;
  activa: boolean;
}

export interface ActualizarPlantillaNotificacionRequest {
  canal: string;
  asunto: string;
  cuerpoHtml: string;
  cuerpoTexto?: string | null;
  activa: boolean;
}
