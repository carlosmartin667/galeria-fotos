import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import {
  CrearLinkDescargaRequest,
  CrearLinkDescargaResponse,
  Descarga,
  RegenerarDescargaResponse
} from '../models/descarga.models';
import { ApiHttpService } from './api-http.service';
import { extractItems } from './response-utils';

type DescargasResponse = Descarga[] | { items?: Descarga[]; data?: Descarga[]; value?: Descarga[]; results?: Descarga[] };

@Injectable({ providedIn: 'root' })
export class DescargasService {
  private readonly api = inject(ApiHttpService);

  createLink(payload: CrearLinkDescargaRequest): Observable<CrearLinkDescargaResponse> {
    return this.api.post<CrearLinkDescargaResponse>('/Descargas/link', payload);
  }

  getMisDescargas(): Observable<Descarga[]> {
    return this.api.get<DescargasResponse>('/Descargas/mis-descargas').pipe(map(extractItems));
  }

  getDescarga(id: string): Observable<Descarga> {
    return this.api.get<Descarga>(`/Descargas/${id}`);
  }

  regenerarDescarga(id: string): Observable<RegenerarDescargaResponse> {
    return this.api.post<RegenerarDescargaResponse>(`/Descargas/${id}/regenerar`, {});
  }

  getDescargasAdmin(): Observable<Descarga[]> {
    return this.api.get<DescargasResponse>('/Descargas/admin').pipe(map(extractItems));
  }
}
