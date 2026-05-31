import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiHttpService } from './api-http.service';
import {
  ActualizarEventoRequestDto,
  ApiListResponse,
  CrearEventoRequestDto,
  Evento,
  Uuid,
  extractItems
} from './models';

@Injectable({ providedIn: 'root' })
export class EventosService {
  private readonly api = inject(ApiHttpService);

  list(): Observable<Evento[]> {
    return this.api.get<ApiListResponse<Evento>>('/Eventos').pipe(map(extractItems));
  }

  get(id: Uuid): Observable<Evento> {
    return this.api.get<Evento>(`/Eventos/${id}`);
  }

  create(payload: CrearEventoRequestDto): Observable<Evento> {
    return this.api.post<Evento>('/Eventos', payload);
  }

  update(id: Uuid, payload: ActualizarEventoRequestDto): Observable<Evento> {
    return this.api.put<Evento>(`/Eventos/${id}`, payload);
  }

  delete(id: Uuid): Observable<void> {
    return this.api.delete<void>(`/Eventos/${id}`);
  }
}
