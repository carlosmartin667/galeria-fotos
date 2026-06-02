export interface PortfolioItem {
  id?: string;
  titulo: string;
  descripcion?: string | null;
  imagenUrl?: string | null;
  categoria?: string | null;
  orden?: number;
  destacado?: boolean;
  activo?: boolean;
  fechaCreacionUtc?: string;
  fechaActualizacionUtc?: string | null;
}

export interface CrearPortfolioItemRequest {
  titulo: string;
  descripcion?: string | null;
  imagenUrl?: string | null;
  categoria?: string | null;
  orden: number;
  destacado: boolean;
  activo: boolean;
}

export interface ActualizarPortfolioItemRequest extends CrearPortfolioItemRequest {}
