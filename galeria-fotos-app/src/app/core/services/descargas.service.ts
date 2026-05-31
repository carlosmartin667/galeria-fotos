import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { CrearLinkDescargaRequest, LinkDescargaResponse } from '../models/descarga.models';
import { ApiHttpService } from './api-http.service';

@Injectable({ providedIn: 'root' })
export class DescargasService {
  private readonly api = inject(ApiHttpService);

  createLink(payload: CrearLinkDescargaRequest): Observable<LinkDescargaResponse> {
    return this.api.post<LinkDescargaResponse>('/Descargas/link', payload);
  }
}
