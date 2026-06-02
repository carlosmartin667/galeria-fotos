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
  tieneMarcaAgua?: boolean;
  procesada?: boolean;
  fechaActualizacionUtc?: string;
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
  tieneMarcaAgua?: boolean;
  procesada?: boolean;
}

export interface ActualizarFotoRequest {
  nombreArchivo: string;
  previewUrl?: string;
  marcaAguaStorageKey?: string;
  precioUnitario: number;
  tieneMarcaAgua?: boolean;
  procesada?: boolean;
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

export interface GenerarStorageKeysBulkRequest {
  eventoId: string;
  nombresArchivo: string[];
}

export interface StorageKeyBulkItem {
  nombreArchivo?: string;
  storageKey?: string;
  key?: string;
  error?: string;
  omitida?: boolean;
  [key: string]: unknown;
}

export interface GenerarStorageKeysBulkResponse {
  items?: StorageKeyBulkItem[];
  resultados?: StorageKeyBulkItem[];
  storageKeys?: StorageKeyBulkItem[];
  creadas?: number;
  omitidas?: number;
  errores?: unknown[];
  [key: string]: unknown;
}

export interface CrearFotoMetadataBulkRequest {
  fotos: CrearFotoMetadataRequest[];
}

export interface CrearFotoMetadataBulkResponse {
  creadas?: number;
  omitidas?: number;
  errores?: unknown[];
  items?: unknown[];
  fotos?: Foto[];
  [key: string]: unknown;
}
