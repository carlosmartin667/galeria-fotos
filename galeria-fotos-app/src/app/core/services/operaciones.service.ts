import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { AdminOperacionesPendientes, AdminOperacionesResumen } from '../models/operaciones.models';
import { ApiHttpService } from './api-http.service';

@Injectable({ providedIn: 'root' })
export class OperacionesService {
  private readonly api = inject(ApiHttpService);

  getResumen(): Observable<AdminOperacionesResumen> {
    return this.api.get<AdminOperacionesResumen>('/Admin/operaciones/resumen');
  }

  getPendientes(): Observable<AdminOperacionesPendientes> {
    return this.api.get<AdminOperacionesPendientes>('/Admin/operaciones/pendientes');
  }
}
