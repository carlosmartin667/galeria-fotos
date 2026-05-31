import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiHttpService } from './api-http.service';
import { CrearPreferenciaPagoRequestDto, MercadoPagoWebhookDto, PreferenciaPago } from './models';

@Injectable({ providedIn: 'root' })
export class PagosService {
  private readonly api = inject(ApiHttpService);

  createCheckoutPreference(payload: CrearPreferenciaPagoRequestDto): Observable<PreferenciaPago> {
    return this.api.post<PreferenciaPago>('/Pagos/checkout-pro/preferencias', payload);
  }

  notifyMercadoPagoWebhook(payload: MercadoPagoWebhookDto): Observable<void> {
    return this.api.post<void>('/Pagos/webhooks/mercado-pago', payload);
  }
}
