export interface CrearLinkDescargaRequest {
  pedidoId: string;
  fotoId: string;
}

export interface LinkDescargaResponse {
  url?: string;
  expiresAtUtc?: string;
}
