export interface AgendaItem {
  id?: string;
  titulo: string;
  descripcion?: string | null;
  tipo: string;
  fechaInicioUtc: string;
  fechaFinUtc: string;
  ubicacion?: string | null;
  estado?: string | null;
  eventoId?: string | null;
  sesionPrivadaId?: string | null;
  clienteId?: string | null;
  solicitudPresupuestoId?: string | null;
  activo?: boolean;
  fechaCreacionUtc?: string;
  fechaActualizacionUtc?: string | null;
}

export interface CrearAgendaItemRequest {
  titulo: string;
  descripcion?: string | null;
  tipo: string;
  fechaInicioUtc: string;
  fechaFinUtc: string;
  ubicacion?: string | null;
  estado?: string | null;
  eventoId?: string | null;
  sesionPrivadaId?: string | null;
  clienteId?: string | null;
  solicitudPresupuestoId?: string | null;
  activo: boolean;
}

export interface ActualizarAgendaItemRequest extends CrearAgendaItemRequest {}

export interface AgendaQuery {
  desde?: string | null;
  hasta?: string | null;
  tipo?: string | null;
  estado?: string | null;
  activo?: boolean | null;
}

export interface DisponibilidadAgendaItem {
  fechaInicioUtc: string;
  fechaFinUtc: string;
  ocupado: boolean;
  tipo?: string | null;
}

export interface DisponibilidadAgendaResponse {
  items?: DisponibilidadAgendaItem[];
}
