export const SESION_PRIVADA_ESTADOS = [
  'Borrador',
  'Programada',
  'EnEdicion',
  'ListaParaCliente',
  'Publicada',
  'Finalizada',
  'Cancelada'
] as const;

export type SesionPrivadaEstado = typeof SESION_PRIVADA_ESTADOS[number];

export interface SesionPrivada {
  id?: string;
  clienteId?: string | null;
  clienteNombre?: string | null;
  titulo: string;
  descripcion?: string | null;
  fechaSesionUtc?: string | null;
  estado?: string | null;
  precioPaquete?: number | null;
  activa?: boolean;
  fechaCreacionUtc?: string | null;
  fechaActualizacionUtc?: string | null;
}

export interface CambiarEstadoSesionPrivadaRequest {
  estado: string;
  comentario?: string | null;
}
