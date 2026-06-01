export interface FavoritoEventoResponse {
  id: string;
  eventoId: string;
  nombreEvento?: string;
  fechaEventoUtc?: string;
  fechaCreacionUtc: string;
}

export interface FavoritoFotoResponse {
  id: string;
  fotoId: string;
  eventoId?: string;
  nombreArchivo?: string;
  previewUrl?: string;
  fechaCreacionUtc: string;
}
