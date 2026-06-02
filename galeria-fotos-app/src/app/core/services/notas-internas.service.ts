import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ActualizarNotaInternaRequest, CrearNotaInternaRequest, NotaInterna } from '../models/nota-interna.models';
import { ApiHttpService } from './api-http.service';
import { extractItems } from './response-utils';

type NotasResponse = NotaInterna[] | { items?: NotaInterna[]; data?: NotaInterna[]; value?: NotaInterna[]; results?: NotaInterna[] };

@Injectable({ providedIn: 'root' })
export class NotasInternasService {
  private readonly api = inject(ApiHttpService);

  getNotas(entidadTipo: string, entidadId: string): Observable<NotaInterna[]> {
    return this.api.get<NotasResponse>(`/NotasInternas/${entidadTipo}/${entidadId}`).pipe(map(extractItems));
  }

  crearNota(entidadTipo: string, entidadId: string, request: CrearNotaInternaRequest): Observable<NotaInterna> {
    return this.api.post<NotaInterna>(`/NotasInternas/${entidadTipo}/${entidadId}`, request);
  }

  actualizarNota(id: string, request: ActualizarNotaInternaRequest): Observable<NotaInterna> {
    return this.api.put<NotaInterna>(`/NotasInternas/${id}`, request);
  }

  eliminarNota(id: string): Observable<void> {
    return this.api.delete<void>(`/NotasInternas/${id}`);
  }
}
