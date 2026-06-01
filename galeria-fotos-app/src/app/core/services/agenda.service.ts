import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import {
  ActualizarAgendaItemRequest,
  AgendaItem,
  AgendaQuery,
  CrearAgendaItemRequest,
  DisponibilidadAgendaItem,
  DisponibilidadAgendaResponse
} from '../models/agenda.models';
import { ApiHttpService } from './api-http.service';
import { extractItems } from './response-utils';

type AgendaResponse = AgendaItem[] | { items?: AgendaItem[]; data?: AgendaItem[]; value?: AgendaItem[]; results?: AgendaItem[] };
type DisponibilidadResponse = DisponibilidadAgendaItem[] | DisponibilidadAgendaResponse | {
  data?: DisponibilidadAgendaItem[];
  value?: DisponibilidadAgendaItem[];
  results?: DisponibilidadAgendaItem[];
};

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private readonly api = inject(ApiHttpService);

  getAgenda(query: AgendaQuery = {}): Observable<AgendaItem[]> {
    return this.api.get<AgendaResponse>('/Agenda', {
      Desde: query.desde,
      Hasta: query.hasta,
      Tipo: query.tipo,
      Estado: query.estado,
      Activo: query.activo
    }).pipe(map(extractItems));
  }

  getAgendaItem(id: string): Observable<AgendaItem> {
    return this.api.get<AgendaItem>(`/Agenda/${id}`);
  }

  crearAgendaItem(request: CrearAgendaItemRequest): Observable<AgendaItem> {
    return this.api.post<AgendaItem>('/Agenda', request);
  }

  actualizarAgendaItem(id: string, request: ActualizarAgendaItemRequest): Observable<AgendaItem> {
    return this.api.put<AgendaItem>(`/Agenda/${id}`, request);
  }

  eliminarAgendaItem(id: string): Observable<void> {
    return this.api.delete<void>(`/Agenda/${id}`);
  }

  getDisponibilidad(desde?: string | null, hasta?: string | null): Observable<DisponibilidadAgendaItem[]> {
    return this.api.get<DisponibilidadResponse>('/Agenda/disponibilidad', { desde, hasta }).pipe(map(extractItems));
  }
}
