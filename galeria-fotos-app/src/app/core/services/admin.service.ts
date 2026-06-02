import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ActualizarAdminPerfilRequest, AdminDashboard, AdminPerfilPublico } from '../models/admin.models';
import { ImportarFotosPexelsRequest, ImportarFotosPexelsResponse } from '../models/pexels.models';
import { ApiHttpService } from './api-http.service';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = inject(ApiHttpService);

  getPerfilPublico(): Observable<AdminPerfilPublico> {
    return this.api.get<AdminPerfilPublico>('/Admin/perfil-publico');
  }

  getDashboard(): Observable<AdminDashboard> {
    return this.api.get<AdminDashboard>('/Admin/dashboard');
  }

  getMiPerfil(): Observable<AdminPerfilPublico> {
    return this.api.get<AdminPerfilPublico>('/Admin/mi-perfil');
  }

  updateMiPerfil(payload: ActualizarAdminPerfilRequest): Observable<AdminPerfilPublico> {
    return this.api.put<AdminPerfilPublico>('/Admin/mi-perfil', payload);
  }

  importarFotosPexels(payload: ImportarFotosPexelsRequest): Observable<ImportarFotosPexelsResponse> {
    return this.api.post<ImportarFotosPexelsResponse>('/Admin/demo/pexels/importar-fotos', payload);
  }
}
