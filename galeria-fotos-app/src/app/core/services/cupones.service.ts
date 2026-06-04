import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import {
  ActualizarCuponDescuentoRequest,
  CrearCuponDescuentoRequest,
  CuponDescuento,
  CuponUso,
  ValidarCuponRequest,
  ValidarCuponResponse
} from '../models/cupon.models';
import { ApiHttpService } from './api-http.service';
import { extractItems } from './response-utils';

type CuponesResponse = CuponDescuento[] | { items?: CuponDescuento[]; data?: CuponDescuento[]; value?: CuponDescuento[]; results?: CuponDescuento[] };
type CuponUsosResponse = CuponUso[] | { items?: CuponUso[]; data?: CuponUso[]; value?: CuponUso[]; results?: CuponUso[] };

@Injectable({ providedIn: 'root' })
export class CuponesService {
  private readonly api = inject(ApiHttpService);

  getAdmin(): Observable<CuponDescuento[]> {
    return this.api.get<CuponesResponse>('/Cupones/admin').pipe(map(extractItems));
  }

  getAdminById(id: string): Observable<CuponDescuento> {
    return this.api.get<CuponDescuento>(`/Cupones/admin/${id}`);
  }

  crear(request: CrearCuponDescuentoRequest): Observable<CuponDescuento> {
    return this.api.post<CuponDescuento>('/Cupones', request);
  }

  actualizar(id: string, request: ActualizarCuponDescuentoRequest): Observable<CuponDescuento> {
    return this.api.put<CuponDescuento>(`/Cupones/${id}`, request);
  }

  eliminar(id: string): Observable<void> {
    return this.api.delete<void>(`/Cupones/${id}`);
  }

  activar(id: string): Observable<CuponDescuento> {
    return this.api.post<CuponDescuento>(`/Cupones/${id}/activar`, {});
  }

  desactivar(id: string): Observable<CuponDescuento> {
    return this.api.post<CuponDescuento>(`/Cupones/${id}/desactivar`, {});
  }

  getUsos(id: string): Observable<CuponUso[]> {
    return this.api.get<CuponUsosResponse>(`/Cupones/${id}/usos`).pipe(map(extractItems));
  }

  validar(request: ValidarCuponRequest): Observable<ValidarCuponResponse> {
    return this.api.post<ValidarCuponResponse>('/Cupones/validar', request);
  }
}
