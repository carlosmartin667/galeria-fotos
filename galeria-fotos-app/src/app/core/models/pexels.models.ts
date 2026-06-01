export interface ImportarFotosPexelsRequest {
  eventoId: string;
  query: string;
  cantidad: number;
  precioUnitario: number;
}

export interface FotoImportadaPexels {
  fotoId?: string;
  nombreArchivo?: string;
  previewUrl?: string;
  storageKey?: string;
  precioUnitario?: number;
}

export interface ImportarFotosPexelsResponse {
  eventoId?: string;
  query?: string;
  cantidadSolicitada?: number;
  cantidadImportada?: number;
  cantidadDuplicada?: number;
  fotos?: FotoImportadaPexels[];
}
