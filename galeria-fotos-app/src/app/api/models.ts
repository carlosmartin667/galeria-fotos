export type Uuid = string;

export interface RegisterRequestDto {
  nombre: string;
  email: string;
  password: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  accessToken?: string;
  jwt?: string;
  refreshToken?: string;
  email?: string;
  nombre?: string;
  expiresAtUtc?: string;
}

export interface CrearClienteRequestDto {
  nombre: string;
  email: string;
  telefono?: string | null;
  documento?: string | null;
}

export type ActualizarClienteRequestDto = CrearClienteRequestDto;

export interface Cliente extends CrearClienteRequestDto {
  id: Uuid;
  creadoUtc?: string;
  actualizadoUtc?: string;
}

export interface CrearEventoRequestDto {
  nombre: string;
  descripcion?: string | null;
  fechaEventoUtc: string;
  clientePrincipalId?: Uuid | null;
}

export interface ActualizarEventoRequestDto extends CrearEventoRequestDto {
  estado: string;
}

export interface Evento extends CrearEventoRequestDto {
  id: Uuid;
  estado?: string;
  clientePrincipal?: Cliente | null;
  creadoUtc?: string;
  actualizadoUtc?: string;
}

export interface ActualizarFotoRequestDto {
  nombreArchivo: string;
  previewUrl?: string | null;
  marcaAguaStorageKey?: string | null;
  precioUnitario?: number;
  activa?: boolean;
}

export interface CrearFotoMetadataRequestDto {
  eventoId: Uuid;
  nombreArchivo: string;
  contentType: string;
  storageKey: string;
  previewUrl?: string | null;
  marcaAguaStorageKey?: string | null;
  sizeInBytes?: number;
  width?: number | null;
  height?: number | null;
  precioUnitario?: number;
}

export interface GenerarStorageKeyRequestDto {
  eventoId: Uuid;
  nombreArchivo: string;
}

export interface Foto extends CrearFotoMetadataRequestDto {
  id: Uuid;
  activa?: boolean;
  creadoUtc?: string;
  actualizadoUtc?: string;
}

export interface CrearPedidoRequestDto {
  eventoId: Uuid;
  clienteId: Uuid;
  fotoIds?: Uuid[] | null;
}

export interface Pedido extends CrearPedidoRequestDto {
  id: Uuid;
  estado?: string;
  total?: number;
  totalAmount?: number;
  creadoUtc?: string;
  actualizadoUtc?: string;
}

export interface CrearLinkDescargaRequestDto {
  pedidoId: Uuid;
  fotoId: Uuid;
}

export interface LinkDescarga {
  url?: string;
  downloadUrl?: string;
  expiresAtUtc?: string;
}

export interface CrearPreferenciaPagoRequestDto {
  pedidoId: Uuid;
}

export interface PreferenciaPago {
  id?: string;
  initPoint?: string;
  sandboxInitPoint?: string;
}

export interface MercadoPagoWebhookDataDto {
  id?: string | null;
}

export interface MercadoPagoWebhookDto {
  action?: string | null;
  type?: string | null;
  data?: MercadoPagoWebhookDataDto;
}

export interface ApiCollectionResponse<T> {
  items?: T[];
  data?: T[];
  value?: T[];
  results?: T[];
  totalCount?: number;
}

export type ApiListResponse<T> = T[] | ApiCollectionResponse<T>;

export function extractItems<T>(response: ApiListResponse<T>): T[] {
  if (Array.isArray(response)) {
    return response;
  }

  return response.items ?? response.data ?? response.value ?? response.results ?? [];
}
