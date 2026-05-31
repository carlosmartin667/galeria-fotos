import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { CrearPreferenciaPagoRequest, MercadoPagoWebhook, PreferenciaPagoResponse } from '../models/pago.models';
import { ApiHttpService } from './api-http.service';

@Injectable({ providedIn: 'root' })
export class PagosService {
  private readonly api = inject(ApiHttpService);

  createPreference(payload: CrearPreferenciaPagoRequest): Observable<PreferenciaPagoResponse> {
    return this.api.post<PreferenciaPagoResponse>('/Pagos/checkout-pro/preferencias', payload);
  }

  notifyMercadoPago(payload: MercadoPagoWebhook): Observable<void> {
    return this.api.post<void>('/Pagos/webhooks/mercado-pago', payload);
  }
}
