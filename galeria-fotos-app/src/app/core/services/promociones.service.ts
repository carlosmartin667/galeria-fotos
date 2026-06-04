import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ActualizarPromocionRequest, CrearPromocionRequest, Promocion } from '../models/promocion.models';
import { ApiHttpService } from './api-http.service';
import { extractItems } from './response-utils';

type PromocionesResponse = Promocion[] | { items?: Promocion[]; data?: Promocion[]; value?: Promocion[]; results?: Promocion[] };

@Injectable({ providedIn: 'root' })
export class PromocionesService {
  private readonly api = inject(ApiHttpService);

  getPublicas(): Observable<Promocion[]> {
    return this.api.get<PromocionesResponse>('/Promociones').pipe(map(extractItems));
  }

  getById(id: string): Observable<Promocion> {
    return this.api.get<Promocion>(`/Promociones/${id}`);
  }

  getAdmin(): Observable<Promocion[]> {
    return this.api.get<PromocionesResponse>('/Promociones/admin').pipe(map(extractItems));
  }

  crear(request: CrearPromocionRequest): Observable<Promocion> {
    return this.api.post<Promocion>('/Promociones', request);
  }

  actualizar(id: string, request: ActualizarPromocionRequest): Observable<Promocion> {
    return this.api.put<Promocion>(`/Promociones/${id}`, request);
  }

  eliminar(id: string): Observable<void> {
    return this.api.delete<void>(`/Promociones/${id}`);
  }

  activar(id: string): Observable<Promocion> {
    return this.api.post<Promocion>(`/Promociones/${id}/activar`, {});
  }

  desactivar(id: string): Observable<Promocion> {
    return this.api.post<Promocion>(`/Promociones/${id}/desactivar`, {});
  }
}
