import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import {
  ActualizarPlantillaNotificacionRequest,
  CrearPlantillaNotificacionRequest,
  Notificacion,
  NotificacionesAdminQuery,
  PlantillaNotificacion
} from '../models/notificacion.models';
import { ApiHttpService } from './api-http.service';
import { extractItems } from './response-utils';

type NotificacionesResponse = Notificacion[] | { items?: Notificacion[]; data?: Notificacion[]; value?: Notificacion[]; results?: Notificacion[] };
type PlantillasResponse = PlantillaNotificacion[] | {
  items?: PlantillaNotificacion[];
  data?: PlantillaNotificacion[];
  value?: PlantillaNotificacion[];
  results?: PlantillaNotificacion[];
};

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private readonly api = inject(ApiHttpService);

  getMisNotificaciones(): Observable<Notificacion[]> {
    return this.api.get<NotificacionesResponse>('/Notificaciones/mis-notificaciones').pipe(map(extractItems));
  }

  marcarLeida(id: string): Observable<Notificacion> {
    return this.api.patch<Notificacion>(`/Notificaciones/${id}/leer`);
  }

  marcarTodasLeidas(): Observable<void> {
    return this.api.patch<void>('/Notificaciones/marcar-todas-leidas');
  }

  getAdmin(query: NotificacionesAdminQuery = {}): Observable<Notificacion[]> {
    return this.api.get<NotificacionesResponse>('/Notificaciones/admin', {
      Estado: query.estado,
      Canal: query.canal,
      Tipo: query.tipo,
      Activa: query.activa,
      Take: query.take
    }).pipe(map(extractItems));
  }

  getAdminDetalle(id: string): Observable<Notificacion> {
    return this.api.get<Notificacion>(`/Notificaciones/admin/${id}`);
  }

  reenviar(id: string): Observable<Notificacion> {
    return this.api.post<Notificacion>(`/Notificaciones/admin/${id}/reenviar`, {});
  }

  cancelar(id: string): Observable<Notificacion> {
    return this.api.patch<Notificacion>(`/Notificaciones/admin/${id}/cancelar`);
  }

  getPlantillas(): Observable<PlantillaNotificacion[]> {
    return this.api.get<PlantillasResponse>('/Notificaciones/plantillas').pipe(map(extractItems));
  }

  crearPlantilla(request: CrearPlantillaNotificacionRequest): Observable<PlantillaNotificacion> {
    return this.api.post<PlantillaNotificacion>('/Notificaciones/plantillas', request);
  }

  actualizarPlantilla(id: string, request: ActualizarPlantillaNotificacionRequest): Observable<PlantillaNotificacion> {
    return this.api.put<PlantillaNotificacion>(`/Notificaciones/plantillas/${id}`, request);
  }

  activarPlantilla(id: string): Observable<PlantillaNotificacion> {
    return this.api.patch<PlantillaNotificacion>(`/Notificaciones/plantillas/${id}/activar`);
  }

  desactivarPlantilla(id: string): Observable<PlantillaNotificacion> {
    return this.api.patch<PlantillaNotificacion>(`/Notificaciones/plantillas/${id}/desactivar`);
  }
}
