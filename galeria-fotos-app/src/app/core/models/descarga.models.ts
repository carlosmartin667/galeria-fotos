export interface CrearLinkDescargaRequest {
  pedidoId: string;
  fotoId?: string | null;
  fotoPrivadaId?: string | null;
}

export interface CrearLinkDescargaResponse {
  descargaId?: string;
  id?: string;
  url?: string | null;
  expiraEnUtc?: string;
  expiresAtUtc?: string;
  maxDescargas?: number | null;
  descargasRealizadas?: number;
  ultimaDescargaUtc?: string | null;
}

export interface Descarga {
  id: string;
  pedidoId: string;
  eventoId?: string | null;
  fotoId?: string | null;
  fotoPrivadaId?: string | null;
  nombreArchivo?: string | null;
  expiraEnUtc?: string;
  expiresAtUtc?: string;
  maxDescargas?: number | null;
  descargasRealizadas?: number;
  ultimaDescargaUtc?: string | null;
  activa?: boolean;
  fechaActualizacionUtc?: string | null;
  url?: string | null;
  clienteId?: string | null;
  clienteNombre?: string | null;
  clienteEmail?: string | null;
  usuarioId?: string | null;
  usuarioNombre?: string | null;
  usuarioEmail?: string | null;
}

export interface RegenerarDescargaResponse {
  descargaId: string;
  id?: string;
  expiraEnUtc?: string;
  expiresAtUtc?: string;
  maxDescargas?: number | null;
  descargasRealizadas?: number;
  ultimaDescargaUtc?: string | null;
  url?: string | null;
}
