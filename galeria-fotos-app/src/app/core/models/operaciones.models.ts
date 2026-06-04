export interface OperacionPedidoResumen {
  id?: string;
  pedidoId?: string;
  clienteId?: string | null;
  clienteNombre?: string | null;
  clienteEmail?: string | null;
  estado?: string | null;
  total?: number | null;
  moneda?: string | null;
  fechaCreacionUtc?: string | null;
  fechaActualizacionUtc?: string | null;
}

export interface OperacionSolicitudResumen {
  id?: string;
  nombre?: string | null;
  email?: string | null;
  whatsApp?: string | null;
  tipoEvento?: string | null;
  estado?: string | null;
  activa?: boolean;
  fechaCreacionUtc?: string | null;
}

export interface OperacionAgendaResumen {
  id?: string;
  titulo?: string | null;
  tipo?: string | null;
  estado?: string | null;
  fechaInicioUtc?: string | null;
  fechaFinUtc?: string | null;
}

export interface OperacionSesionPrivadaResumen {
  id?: string;
  clienteId?: string | null;
  clienteNombre?: string | null;
  titulo?: string | null;
  estado?: string | null;
  activa?: boolean;
  fechaSesionUtc?: string | null;
}

export interface OperacionDescargaResumen {
  id?: string;
  pedidoId?: string | null;
  clienteId?: string | null;
  clienteNombre?: string | null;
  activa?: boolean;
  expiraEnUtc?: string | null;
  descargasRealizadas?: number | null;
  maxDescargas?: number | null;
}

export interface AdminOperacionesResumen {
  solicitudesNuevas?: number;
  solicitudesPendientesContacto?: number;
  pedidosPendientesPago?: number;
  pedidosPagados?: number;
  pedidosPreparandoDescarga?: number;
  pedidosListosParaDescargar?: number;
  sesionesPrivadasActivas?: number;
  eventosProximos?: number;
  descargasVencidas?: number;
  descargasPorVencer?: number;
  pedidosRecientes?: OperacionPedidoResumen[];
  solicitudesRecientes?: OperacionSolicitudResumen[];
  agendaProxima?: OperacionAgendaResumen[];
  sesionesPrivadasRecientes?: OperacionSesionPrivadaResumen[];
  descargasRecientes?: OperacionDescargaResumen[];
  [key: string]: unknown;
}

export interface AdminOperacionesPendientes {
  pedidosPendientes?: OperacionPedidoResumen[];
  pedidosPagados?: OperacionPedidoResumen[];
  pedidosPreparandoDescarga?: OperacionPedidoResumen[];
  solicitudesPendientes?: OperacionSolicitudResumen[];
  agendaProxima?: OperacionAgendaResumen[];
  sesionesPrivadasActivas?: OperacionSesionPrivadaResumen[];
  descargasVencidas?: OperacionDescargaResumen[];
  descargasPorVencer?: OperacionDescargaResumen[];
  [key: string]: unknown;
}
