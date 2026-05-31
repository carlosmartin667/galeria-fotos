import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ActualizarEventoRequest, CrearEventoRequest, Evento } from '../models/evento.models';
import { ApiHttpService } from './api-http.service';
import { extractItems } from './response-utils';

@Injectable({ providedIn: 'root' })
export class EventosService {
  private readonly api = inject(ApiHttpService);

  list(): Observable<Evento[]> {
    return this.api.get<Evento[] | { items?: Evento[]; data?: Evento[] }>('/Eventos').pipe(map(extractItems));
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
}
