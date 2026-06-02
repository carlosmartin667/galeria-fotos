import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { PerfilFotografa, SitioContacto, SitioHome } from '../models/sitio-publico.models';
import { ApiHttpService } from './api-http.service';

@Injectable({ providedIn: 'root' })
export class SitioPublicoService {
  private readonly api = inject(ApiHttpService);

  getHome(): Observable<SitioHome> {
    return this.api.get<SitioHome>('/Sitio/home');
  }

  getContacto(): Observable<SitioContacto> {
    return this.api.get<SitioContacto>('/Sitio/contacto');
  }

  getPerfilFotografa(): Observable<PerfilFotografa> {
    return this.api.get<PerfilFotografa>('/Sitio/perfil-fotografa');
  }
}
