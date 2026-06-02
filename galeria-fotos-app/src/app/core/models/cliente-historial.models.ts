import { Cliente } from './cliente.models';

export interface ClienteHistorialTotales {
  totalPedidos?: number | null;
  totalGastado?: number | null;
  totalDescargas?: number | null;
  totalSesionesPrivadas?: number | null;
  totalEventos?: number | null;
  totalSolicitudes?: number | null;
  ultimaCompraUtc?: string | null;
  ultimaActividadUtc?: string | null;
  [key: string]: unknown;
}

export interface ClienteHistorialPedido {
  id?: string;
  estado?: string | null;
  total?: number | null;
  moneda?: string | null;
  fechaCreacionUtc?: string | null;
  [key: string]: unknown;
}

export interface ClienteHistorialPago {
  id?: string;
  pedidoId?: string | null;
  estado?: string | null;
  monto?: number | null;
  moneda?: string | null;
  fechaCreacionUtc?: string | null;
  [key: string]: unknown;
}

export interface ClienteHistorialDescarga {
  id?: string;
  pedidoId?: string | null;
  activa?: boolean;
  expiraEnUtc?: string | null;
  descargasRealizadas?: number | null;
  maxDescargas?: number | null;
  [key: string]: unknown;
}

export interface ClienteHistorialSesionPrivada {
  id?: string;
  titulo?: string | null;
  estado?: string | null;
  fechaSesionUtc?: string | null;
  activa?: boolean;
  [key: string]: unknown;
}

export interface ClienteHistorialEvento {
  id?: string;
  nombre?: string | null;
  estado?: string | null;
  fechaEventoUtc?: string | null;
  [key: string]: unknown;
}

export interface ClienteHistorialComentario {
  id?: string;
  texto?: string | null;
  entidadTipo?: string | null;
  fechaCreacionUtc?: string | null;
  [key: string]: unknown;
}

export interface ClienteHistorialSolicitudPresupuesto {
  id?: string;
  tipoEvento?: string | null;
  estado?: string | null;
  fechaCreacionUtc?: string | null;
  [key: string]: unknown;
}

export interface ClienteHistorialAgendaItem {
  id?: string;
  titulo?: string | null;
  tipo?: string | null;
  estado?: string | null;
  fechaInicioUtc?: string | null;
  fechaFinUtc?: string | null;
  [key: string]: unknown;
}

export interface ClienteHistorial {
  cliente?: Cliente | null;
  totales?: ClienteHistorialTotales | null;
  pedidos?: ClienteHistorialPedido[];
  pagos?: ClienteHistorialPago[];
  descargas?: ClienteHistorialDescarga[];
  eventos?: ClienteHistorialEvento[];
  sesionesPrivadas?: ClienteHistorialSesionPrivada[];
  solicitudesPresupuesto?: ClienteHistorialSolicitudPresupuesto[];
  agenda?: ClienteHistorialAgendaItem[];
  favoritos?: Record<string, unknown>[];
  comentarios?: ClienteHistorialComentario[];
  [key: string]: unknown;
}
