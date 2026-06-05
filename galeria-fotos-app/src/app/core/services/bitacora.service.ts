import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { BitacoraItem, BitacoraListResponse, BitacoraQuery, BitacoraResumen } from '../models/bitacora.models';
import { ApiHttpService } from './api-http.service';
import { normalizePaginatedResponse } from './response-utils';

@Injectable({ providedIn: 'root' })
export class BitacoraService {
  private readonly api = inject(ApiHttpService);

  getBitacora(query: BitacoraQuery = {}): Observable<BitacoraListResponse> {
    return this.api.get<unknown>('/Bitacora', {
      Desde: query.desde,
      Hasta: query.hasta,
      UsuarioId: query.usuarioId,
      UsuarioEmail: query.usuarioEmail,
      Accion: query.accion,
      EntidadTipo: query.entidadTipo,
      EntidadId: query.entidadId,
      Severidad: query.severidad,
      CorrelationId: query.correlationId,
      Page: query.page,
      PageSize: query.pageSize
    }).pipe(map((response) => normalizePaginatedResponse<BitacoraItem>(response)));
  }

  getDetalle(id: string): Observable<BitacoraItem> {
    return this.api.get<BitacoraItem>(`/Bitacora/${id}`);
  }

  getResumen(): Observable<BitacoraResumen> {
    return this.api.get<BitacoraResumen>('/Bitacora/resumen');
  }
}
