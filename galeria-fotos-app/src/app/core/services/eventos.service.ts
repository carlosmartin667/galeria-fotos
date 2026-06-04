import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ActualizarEventoRequest, CrearEventoRequest, Evento } from '../models/evento.models';
import { PaginatedResponse, PaginationQuery } from '../models/pagination.models';
import { ApiHttpService } from './api-http.service';
import { extractItems, normalizePaginatedResponse } from './response-utils';

@Injectable({ providedIn: 'root' })
export class EventosService {
  private readonly api = inject(ApiHttpService);

  list(): Observable<Evento[]> {
    return this.api.get<Evento[] | { items?: Evento[]; data?: Evento[] }>('/Eventos').pipe(map(extractItems));
  }

  getEventosPaginados(query: PaginationQuery): Observable<PaginatedResponse<Evento>> {
    return this.api
      .get<unknown>('/Eventos/paginado', this.paginationParams(query))
      .pipe(map((response) => normalizePaginatedResponse<Evento>(response)));
  }

  get(id: string): Observable<Evento> {
    return this.api.get<Evento>(`/Eventos/${id}`);
  }

  create(payload: CrearEventoRequest): Observable<Evento> {
    return this.api.post<Evento>('/Eventos', payload);
  }

  update(id: string, payload: ActualizarEventoRequest): Observable<Evento> {
    return this.api.put<Evento>(`/Eventos/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/Eventos/${id}`);
  }

  asignarPortada(eventoId: string, fotoId: string): Observable<Evento> {
    return this.api.put<Evento>(`/Eventos/${eventoId}/portada/${fotoId}`, {});
  }

  private paginationParams(query: PaginationQuery): Record<string, string | number | boolean> {
    return {
      Page: query.page,
      PageSize: query.pageSize,
      All: query.all
    };
  }
}
