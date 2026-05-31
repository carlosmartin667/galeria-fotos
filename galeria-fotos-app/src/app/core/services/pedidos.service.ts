import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { CrearPedidoRequest, Pedido } from '../models/pedido.models';
import { ApiHttpService } from './api-http.service';
import { extractItems } from './response-utils';

@Injectable({ providedIn: 'root' })
export class PedidosService {
  private readonly api = inject(ApiHttpService);

  list(): Observable<Pedido[]> {
    return this.api.get<Pedido[] | { items?: Pedido[]; data?: Pedido[] }>('/Pedidos').pipe(map(extractItems));
  }

  get(id: string): Observable<Pedido> {
    return this.api.get<Pedido>(`/Pedidos/${id}`);
  }

  create(payload: CrearPedidoRequest): Observable<Pedido> {
    return this.api.post<Pedido>('/Pedidos', payload);
  }
}
