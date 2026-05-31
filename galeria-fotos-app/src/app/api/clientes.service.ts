import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiHttpService } from './api-http.service';
import {
  ActualizarClienteRequestDto,
  ApiListResponse,
  Cliente,
  CrearClienteRequestDto,
  Uuid,
  extractItems
} from './models';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly api = inject(ApiHttpService);

  list(): Observable<Cliente[]> {
    return this.api.get<ApiListResponse<Cliente>>('/Clientes').pipe(map(extractItems));
  }

  get(id: Uuid): Observable<Cliente> {
    return this.api.get<Cliente>(`/Clientes/${id}`);
  }

  create(payload: CrearClienteRequestDto): Observable<Cliente> {
    return this.api.post<Cliente>('/Clientes', payload);
  }

  update(id: Uuid, payload: ActualizarClienteRequestDto): Observable<Cliente> {
    return this.api.put<Cliente>(`/Clientes/${id}`, payload);
  }

  delete(id: Uuid): Observable<void> {
    return this.api.delete<void>(`/Clientes/${id}`);
  }
}
