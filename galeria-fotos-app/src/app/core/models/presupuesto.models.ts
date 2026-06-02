export interface SolicitudPresupuesto {
  id?: string;
  nombre: string;
  email: string;
  whatsApp?: string | null;
  tipoEvento?: string | null;
  servicioId?: string | null;
  servicioNombre?: string | null;
  fechaTentativaUtc?: string | null;
  lugar?: string | null;
  cantidadInvitados?: number | null;
  mensaje: string;
  estado?: string | null;
  activa?: boolean;
  fechaCreacionUtc?: string;
  fechaActualizacionUtc?: string | null;
}

export interface CrearSolicitudPresupuestoRequest {
  nombre: string;
  email: string;
  whatsApp?: string | null;
  tipoEvento?: string | null;
  servicioId?: string | null;
  fechaTentativaUtc?: string | null;
  lugar?: string | null;
  cantidadInvitados?: number | null;
  mensaje: string;
}

export interface ActualizarSolicitudPresupuestoRequest extends CrearSolicitudPresupuestoRequest {
  estado?: string | null;
  activa: boolean;
}

export interface CambiarEstadoSolicitudPresupuestoRequest {
  estado: string;
}
