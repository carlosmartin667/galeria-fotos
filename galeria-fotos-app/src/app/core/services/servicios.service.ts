import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ActualizarServicioFotografiaRequest, CrearServicioFotografiaRequest, ServicioFotografia } from '../models/servicio.models';
import { ApiHttpService } from './api-http.service';
import { extractItems } from './response-utils';

type ServiciosResponse = ServicioFotografia[] | { items?: ServicioFotografia[]; data?: ServicioFotografia[]; value?: ServicioFotografia[]; results?: ServicioFotografia[] };

@Injectable({ providedIn: 'root' })
export class ServiciosService {
  private readonly api = inject(ApiHttpService);

  getPublicos(): Observable<ServicioFotografia[]> {
    return this.api.get<ServiciosResponse>('/Servicios').pipe(map(extractItems));
  }

  getById(id: string): Observable<ServicioFotografia> {
    return this.api.get<ServicioFotografia>(`/Servicios/${id}`);
  }

  getAdmin(): Observable<ServicioFotografia[]> {
    return this.api.get<ServiciosResponse>('/Servicios/admin').pipe(map(extractItems));
  }

  crear(request: CrearServicioFotografiaRequest): Observable<ServicioFotografia> {
    return this.api.post<ServicioFotografia>('/Servicios', request);
  }

  actualizar(id: string, request: ActualizarServicioFotografiaRequest): Observable<ServicioFotografia> {
    return this.api.put<ServicioFotografia>(`/Servicios/${id}`, request);
  }

  eliminar(id: string): Observable<void> {
    return this.api.delete<void>(`/Servicios/${id}`);
  }
}
