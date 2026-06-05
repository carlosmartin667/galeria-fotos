import { PaginatedResponse } from './pagination.models';

export interface BitacoraQuery {
  desde?: string | null;
  hasta?: string | null;
  usuarioId?: string | null;
  usuarioEmail?: string | null;
  accion?: string | null;
  entidadTipo?: string | null;
  entidadId?: string | null;
  severidad?: string | null;
  correlationId?: string | null;
  page?: number | null;
  pageSize?: number | null;
}

export interface BitacoraItem {
  id: string;
  fechaUtc?: string | null;
  fechaCreacionUtc?: string | null;
  fechaActualizacionUtc?: string | null;
  usuarioId?: string | null;
  usuarioEmail?: string | null;
  accion?: string | null;
  entidadTipo?: string | null;
  entidadId?: string | null;
  severidad?: string | null;
  correlationId?: string | null;
  metadataJson?: string | null;
  metadata?: unknown;
  detalle?: string | null;
  mensaje?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export type BitacoraListResponse = PaginatedResponse<BitacoraItem>;

export interface BitacoraResumen {
  total?: number;
  totalRegistros?: number;
  cantidad?: number;
  errores?: number;
  advertencias?: number;
  informacion?: number;
  porSeveridad?: Record<string, number> | Array<Record<string, unknown>>;
  porAccion?: Record<string, number> | Array<Record<string, unknown>>;
  ultimasAcciones?: BitacoraItem[];
  [key: string]: unknown;
}

export interface BitacoraSummaryCard {
  label: string;
  value: string | number;
}
