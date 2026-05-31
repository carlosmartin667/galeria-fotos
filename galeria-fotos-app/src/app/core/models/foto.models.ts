export interface Foto {
  id: string;
  eventoId: string;
  nombreArchivo: string;
  contentType?: string;
  storageKey?: string;
  previewUrl?: string;
  marcaAguaStorageKey?: string;
  sizeInBytes?: number;
  width?: number;
  height?: number;
  precioUnitario?: number;
  activa?: boolean;
}

export interface CrearFotoMetadataRequest {
  eventoId: string;
  nombreArchivo: string;
  contentType: string;
  storageKey: string;
  previewUrl?: string;
  marcaAguaStorageKey?: string;
  sizeInBytes: number;
  width?: number;
  height?: number;
  precioUnitario: number;
}

export interface ActualizarFotoRequest {
  nombreArchivo: string;
  previewUrl?: string;
  marcaAguaStorageKey?: string;
  precioUnitario: number;
  activa: boolean;
}

export interface GenerarStorageKeyRequest {
  eventoId: string;
  nombreArchivo: string;
}

export interface GenerarStorageKeyResponse {
  storageKey?: string;
  key?: string;
}
