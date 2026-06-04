import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ActualizarPreguntaFrecuenteRequest, CrearPreguntaFrecuenteRequest, PreguntaFrecuente } from '../models/faq.models';
import { ApiHttpService } from './api-http.service';
import { extractItems } from './response-utils';

type FaqResponse = PreguntaFrecuente[] | { items?: PreguntaFrecuente[]; data?: PreguntaFrecuente[]; value?: PreguntaFrecuente[]; results?: PreguntaFrecuente[] };

@Injectable({ providedIn: 'root' })
export class FaqService {
  private readonly api = inject(ApiHttpService);

  getPublicas(): Observable<PreguntaFrecuente[]> {
    return this.api.get<FaqResponse>('/Faq').pipe(map(extractItems));
  }

  getById(id: string): Observable<PreguntaFrecuente> {
    return this.api.get<PreguntaFrecuente>(`/Faq/${id}`);
  }

  getAdmin(): Observable<PreguntaFrecuente[]> {
    return this.api.get<FaqResponse>('/Faq/admin').pipe(map(extractItems));
  }

  crear(request: CrearPreguntaFrecuenteRequest): Observable<PreguntaFrecuente> {
    return this.api.post<PreguntaFrecuente>('/Faq', request);
  }

  actualizar(id: string, request: ActualizarPreguntaFrecuenteRequest): Observable<PreguntaFrecuente> {
    return this.api.put<PreguntaFrecuente>(`/Faq/${id}`, request);
  }

  eliminar(id: string): Observable<void> {
    return this.api.delete<void>(`/Faq/${id}`);
  }
}
