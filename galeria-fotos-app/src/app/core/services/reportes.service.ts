import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { AdminVentasResumen, ReporteVentasResumen } from '../models/reporte-ventas.models';
import { ApiHttpService } from './api-http.service';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly api = inject(ApiHttpService);

  getVentasResumen(desde?: string, hasta?: string): Observable<ReporteVentasResumen> {
    return this.api.get<ReporteVentasResumen>('/Reportes/ventas/resumen', { desde, hasta });
  }

  getAdminVentasResumen(): Observable<AdminVentasResumen> {
    return this.api.get<AdminVentasResumen>('/Admin/ventas/resumen');
  }
}
