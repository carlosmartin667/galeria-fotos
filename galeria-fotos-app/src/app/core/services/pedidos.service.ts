import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { CrearPedidoRequest, Pedido } from '../models/pedido.models';
import { PaginatedResponse, PaginationQuery } from '../models/pagination.models';
import { ApiHttpService } from './api-http.service';
import { extractItems, normalizePaginatedResponse } from './response-utils';

@Injectable({ providedIn: 'root' })
export class PedidosService {
  private readonly api = inject(ApiHttpService);

  list(): Observable<Pedido[]> {
    return this.api.get<Pedido[] | { items?: Pedido[]; data?: Pedido[] }>('/Pedidos').pipe(map(extractItems));
  }

  getPedidosPaginados(query: PaginationQuery): Observable<PaginatedResponse<Pedido>> {
    return this.api
      .get<unknown>('/Pedidos/paginado', this.paginationParams(query))
      .pipe(map((response) => normalizePaginatedResponse<Pedido>(response)));
  }

  get(id: string): Observable<Pedido> {
    return this.api.get<Pedido>(`/Pedidos/${id}`);
  }

  create(payload: CrearPedidoRequest): Observable<Pedido> {
    return this.api.post<Pedido>('/Pedidos', payload);
  }

  private paginationParams(query: PaginationQuery): Record<string, string | number | boolean> {
    return {
      Page: query.page,
      PageSize: query.pageSize,
      All: query.all
    };
  }
}
