import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { CarritoAbandonadoRegistro, CarritoAbandonadoResumen } from '../models/carrito-abandonado.models';
import { ApiHttpService } from './api-http.service';
import { extractItems } from './response-utils';

type CarritosAbandonadosResponse = CarritoAbandonadoRegistro[] | {
  items?: CarritoAbandonadoRegistro[];
  data?: CarritoAbandonadoRegistro[];
  value?: CarritoAbandonadoRegistro[];
  results?: CarritoAbandonadoRegistro[];
};

@Injectable({ providedIn: 'root' })
export class CarritosAbandonadosService {
  private readonly api = inject(ApiHttpService);

  getAbandonados(): Observable<CarritoAbandonadoRegistro[]> {
    return this.api.get<CarritosAbandonadosResponse>('/Carritos/abandonados').pipe(map(extractItems));
  }

  getResumen(): Observable<CarritoAbandonadoResumen> {
    return this.api.get<CarritoAbandonadoResumen>('/Carritos/abandonados/resumen');
  }

  detectar(): Observable<CarritoAbandonadoResumen> {
    return this.api.post<CarritoAbandonadoResumen>('/Carritos/abandonados/detectar', {});
  }

  notificar(id: string): Observable<CarritoAbandonadoRegistro> {
    return this.api.post<CarritoAbandonadoRegistro>(`/Carritos/abandonados/${id}/notificar`, {});
  }
}
