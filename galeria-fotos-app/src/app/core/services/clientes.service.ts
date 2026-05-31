import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ActualizarClienteRequest, Cliente, CrearClienteRequest } from '../models/cliente.models';
import { ApiHttpService } from './api-http.service';
import { extractItems } from './response-utils';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly api = inject(ApiHttpService);

  list(): Observable<Cliente[]> {
    return this.api.get<Cliente[] | { items?: Cliente[]; data?: Cliente[] }>('/Clientes').pipe(map(extractItems));
  }

  get(id: string): Observable<Cliente> {
    return this.api.get<Cliente>(`/Clientes/${id}`);
  }

  create(payload: CrearClienteRequest): Observable<Cliente> {
    return this.api.post<Cliente>('/Clientes', payload);
  }

  update(id: string, payload: ActualizarClienteRequest): Observable<Cliente> {
    return this.api.put<Cliente>(`/Clientes/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/Clientes/${id}`);
  }
}
