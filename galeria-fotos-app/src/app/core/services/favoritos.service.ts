import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { FavoritoEventoResponse, FavoritoFotoResponse } from '../models/favorito.models';
import { ApiHttpService } from './api-http.service';
import { extractItems } from './response-utils';

@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private readonly api = inject(ApiHttpService);

  listEventos(): Observable<FavoritoEventoResponse[]> {
    return this.api
      .get<FavoritoEventoResponse[] | { items?: FavoritoEventoResponse[]; data?: FavoritoEventoResponse[] }>('/Favoritos/eventos')
      .pipe(map(extractItems));
  }

  addEvento(eventoId: string): Observable<void> {
    return this.api.post<void>(`/Favoritos/eventos/${eventoId}`, {});
  }

  removeEvento(eventoId: string): Observable<void> {
    return this.api.delete<void>(`/Favoritos/eventos/${eventoId}`);
  }

  listFotos(): Observable<FavoritoFotoResponse[]> {
    return this.api
      .get<FavoritoFotoResponse[] | { items?: FavoritoFotoResponse[]; data?: FavoritoFotoResponse[] }>('/Favoritos/fotos')
      .pipe(map(extractItems));
  }

  addFoto(fotoId: string): Observable<void> {
    return this.api.post<void>(`/Favoritos/fotos/${fotoId}`, {});
  }

  removeFoto(fotoId: string): Observable<void> {
    return this.api.delete<void>(`/Favoritos/fotos/${fotoId}`);
  }
}
