import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ComentarioRequest, ComentarioResponse } from '../models/comentario.models';
import { ApiHttpService } from './api-http.service';
import { extractItems } from './response-utils';

@Injectable({ providedIn: 'root' })
export class ComentariosService {
  private readonly api = inject(ApiHttpService);

  listEvento(eventoId: string): Observable<ComentarioResponse[]> {
    return this.api
      .get<ComentarioResponse[] | { items?: ComentarioResponse[]; data?: ComentarioResponse[] }>(`/Eventos/${eventoId}/comentarios`)
      .pipe(map(extractItems));
  }

  createEvento(eventoId: string, payload: ComentarioRequest): Observable<ComentarioResponse> {
    return this.api.post<ComentarioResponse>(`/Eventos/${eventoId}/comentarios`, payload);
  }

  updateEvento(comentarioId: string, payload: ComentarioRequest): Observable<ComentarioResponse> {
    return this.api.put<ComentarioResponse>(`/Eventos/comentarios/${comentarioId}`, payload);
  }

  deleteEvento(comentarioId: string): Observable<void> {
    return this.api.delete<void>(`/Eventos/comentarios/${comentarioId}`);
  }

  listFoto(fotoId: string): Observable<ComentarioResponse[]> {
    return this.api
      .get<ComentarioResponse[] | { items?: ComentarioResponse[]; data?: ComentarioResponse[] }>(`/Fotos/${fotoId}/comentarios`)
      .pipe(map(extractItems));
  }

  createFoto(fotoId: string, payload: ComentarioRequest): Observable<ComentarioResponse> {
    return this.api.post<ComentarioResponse>(`/Fotos/${fotoId}/comentarios`, payload);
  }

  updateFoto(comentarioId: string, payload: ComentarioRequest): Observable<ComentarioResponse> {
    return this.api.put<ComentarioResponse>(`/Fotos/comentarios/${comentarioId}`, payload);
  }

  deleteFoto(comentarioId: string): Observable<void> {
    return this.api.delete<void>(`/Fotos/comentarios/${comentarioId}`);
  }
}
