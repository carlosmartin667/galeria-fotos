import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiHttpService } from './api-http.service';
import { ApiListResponse, CrearPedidoRequestDto, Pedido, Uuid, extractItems } from './models';

@Injectable({ providedIn: 'root' })
export class PedidosService {
  private readonly api = inject(ApiHttpService);

  list(): Observable<Pedido[]> {
    return this.api.get<ApiListResponse<Pedido>>('/Pedidos').pipe(map(extractItems));
  }

  get(id: Uuid): Observable<Pedido> {
    return this.api.get<Pedido>(`/Pedidos/${id}`);
  }

  create(payload: CrearPedidoRequestDto): Observable<Pedido> {
    return this.api.post<Pedido>('/Pedidos', payload);
  }
}
