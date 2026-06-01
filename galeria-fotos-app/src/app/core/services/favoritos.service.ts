import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { FavoritoEventoResponse, FavoritoFotoResponse } from '../models/favorito.models';
import { PaginatedResponse, PaginationQuery } from '../models/pagination.models';
import { ApiHttpService } from './api-http.service';
import { extractItems, normalizePaginatedResponse } from './response-utils';

@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private readonly api = inject(ApiHttpService);

  listEventos(): Observable<FavoritoEventoResponse[]> {
    return this.api
      .get<FavoritoEventoResponse[] | { items?: FavoritoEventoResponse[]; data?: FavoritoEventoResponse[] }>('/Favoritos/eventos')
      .pipe(map(extractItems));
  }

  getEventosFavoritosPaginados(query: PaginationQuery): Observable<PaginatedResponse<FavoritoEventoResponse>> {
    return this.api
      .get<unknown>('/Favoritos/eventos/paginado', this.paginationParams(query))
      .pipe(map((response) => normalizePaginatedResponse<FavoritoEventoResponse>(response)));
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

  getFotosFavoritasPaginadas(query: PaginationQuery): Observable<PaginatedResponse<FavoritoFotoResponse>> {
    return this.api
      .get<unknown>('/Favoritos/fotos/paginado', this.paginationParams(query))
      .pipe(map((response) => normalizePaginatedResponse<FavoritoFotoResponse>(response)));
  }

  addFoto(fotoId: string): Observable<void> {
    return this.api.post<void>(`/Favoritos/fotos/${fotoId}`, {});
  }

  removeFoto(fotoId: string): Observable<void> {
    return this.api.delete<void>(`/Favoritos/fotos/${fotoId}`);
  }

  private paginationParams(query: PaginationQuery): Record<string, string | number | boolean> {
    return {
      Page: query.page,
      PageSize: query.pageSize,
      All: query.all
    };
  }
}
