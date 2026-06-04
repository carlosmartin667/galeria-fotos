import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import {
  ActualizarSolicitudPresupuestoRequest,
  CambiarEstadoSolicitudPresupuestoRequest,
  CrearSolicitudPresupuestoRequest,
  SolicitudPresupuesto
} from '../models/presupuesto.models';
import { ApiHttpService } from './api-http.service';
import { extractItems } from './response-utils';

type SolicitudesResponse = SolicitudPresupuesto[] | {
  items?: SolicitudPresupuesto[];
  data?: SolicitudPresupuesto[];
  value?: SolicitudPresupuesto[];
  results?: SolicitudPresupuesto[];
};

@Injectable({ providedIn: 'root' })
export class PresupuestosService {
  private readonly api = inject(ApiHttpService);

  crearSolicitud(request: CrearSolicitudPresupuestoRequest): Observable<SolicitudPresupuesto> {
    return this.api.post<SolicitudPresupuesto>('/Presupuestos/solicitudes', request);
  }

  getSolicitudes(activa?: boolean | null): Observable<SolicitudPresupuesto[]> {
    return this.api.get<SolicitudesResponse>('/Presupuestos/solicitudes', { activa }).pipe(map(extractItems));
  }

  getSolicitud(id: string): Observable<SolicitudPresupuesto> {
    return this.api.get<SolicitudPresupuesto>(`/Presupuestos/solicitudes/${id}`);
  }

  actualizarSolicitud(id: string, request: ActualizarSolicitudPresupuestoRequest): Observable<SolicitudPresupuesto> {
    return this.api.put<SolicitudPresupuesto>(`/Presupuestos/solicitudes/${id}`, request);
  }

  cambiarEstado(id: string, estado: string): Observable<SolicitudPresupuesto> {
    const request: CambiarEstadoSolicitudPresupuestoRequest = { estado };
    return this.api.put<SolicitudPresupuesto>(`/Presupuestos/solicitudes/${id}/estado`, request);
  }

  eliminarSolicitud(id: string): Observable<void> {
    return this.api.delete<void>(`/Presupuestos/solicitudes/${id}`);
  }
}
