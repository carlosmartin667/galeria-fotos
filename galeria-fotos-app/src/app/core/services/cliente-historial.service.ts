import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ClienteHistorial } from '../models/cliente-historial.models';
import { ApiHttpService } from './api-http.service';

@Injectable({ providedIn: 'root' })
export class ClienteHistorialService {
  private readonly api = inject(ApiHttpService);

  getHistorialCliente(clienteId: string): Observable<ClienteHistorial> {
    return this.api.get<ClienteHistorial>(`/Clientes/${clienteId}/historial`);
  }

  getMiHistorial(): Observable<ClienteHistorial> {
    return this.api.get<ClienteHistorial>('/Clientes/mi-historial');
  }
}
