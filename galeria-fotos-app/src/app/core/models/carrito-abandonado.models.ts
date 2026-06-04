export interface CarritoAbandonadoRegistro {
  id: string;
  carritoId?: string | null;
  usuarioId?: string | null;
  clienteId?: string | null;
  clienteNombre?: string | null;
  clienteEmail?: string | null;
  email?: string | null;
  estado?: string | null;
  cantidadItems?: number | null;
  totalEstimado?: number | null;
  moneda?: string | null;
  recordatoriosEnviados?: number | null;
  cantidadRecordatorios?: number | null;
  ultimaNotificacionUtc?: string | null;
  fechaAbandonoUtc?: string | null;
  fechaDeteccionUtc?: string | null;
  fechaActualizacionUtc?: string | null;
  fechaCreacionUtc?: string | null;
  recuperado?: boolean;
  activo?: boolean;
}

export interface CarritoAbandonadoResumen {
  total?: number | null;
  totalAbandonados?: number | null;
  pendientes?: number | null;
  notificados?: number | null;
  recuperados?: number | null;
  totalEstimado?: number | null;
  valorEstimado?: number | null;
  tasaRecuperacion?: number | null;
  ultimaDeteccionUtc?: string | null;
}
