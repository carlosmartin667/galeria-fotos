import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiHttpService } from './api-http.service';
import { CrearLinkDescargaRequestDto, LinkDescarga } from './models';

@Injectable({ providedIn: 'root' })
export class DescargasService {
  private readonly api = inject(ApiHttpService);

  createLink(payload: CrearLinkDescargaRequestDto): Observable<LinkDescarga> {
    return this.api.post<LinkDescarga>('/Descargas/link', payload);
  }
}
