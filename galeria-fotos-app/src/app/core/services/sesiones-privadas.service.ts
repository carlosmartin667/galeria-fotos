import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { CambiarEstadoSesionPrivadaRequest, SesionPrivada } from '../models/sesion-privada.models';
import { ApiHttpService } from './api-http.service';
import { extractItems } from './response-utils';

type SesionesResponse = SesionPrivada[] | { items?: SesionPrivada[]; data?: SesionPrivada[]; value?: SesionPrivada[]; results?: SesionPrivada[] };

@Injectable({ providedIn: 'root' })
export class SesionesPrivadasService {
  private readonly api = inject(ApiHttpService);

  list(): Observable<SesionPrivada[]> {
    return this.api.get<SesionesResponse>('/SesionesPrivadas').pipe(map(extractItems));
  }

  get(id: string): Observable<SesionPrivada> {
    return this.api.get<SesionPrivada>(`/SesionesPrivadas/${id}`);
  }

  cambiarEstadoSesionPrivada(id: string, request: CambiarEstadoSesionPrivadaRequest): Observable<SesionPrivada> {
    return this.api.put<SesionPrivada>(`/SesionesPrivadas/${id}/estado`, request);
  }
}
