import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Carrito, CrearPedidoDesdeCarritoResponse } from '../models/carrito.models';
import { AplicarCuponCarritoRequest } from '../models/cupon.models';
import { ApiHttpService } from './api-http.service';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private readonly api = inject(ApiHttpService);

  getCarrito(): Observable<Carrito> {
    return this.api.get<Carrito>('/Carrito');
  }

  agregarFotoEvento(fotoId: string): Observable<Carrito> {
    return this.api.post<Carrito>(`/Carrito/items/foto-evento/${fotoId}`, {});
  }

  agregarPaqueteEvento(paqueteId: string): Observable<Carrito> {
    return this.api.post<Carrito>(`/Carrito/items/paquete-evento/${paqueteId}`, {});
  }

  agregarFotoPrivada(fotoPrivadaId: string): Observable<Carrito> {
    return this.api.post<Carrito>(`/Carrito/items/foto-privada/${fotoPrivadaId}`, {});
  }

  quitarItem(itemId: string): Observable<Carrito> {
    return this.api.delete<Carrito>(`/Carrito/items/${itemId}`);
  }

  vaciar(): Observable<Carrito> {
    return this.api.delete<Carrito>('/Carrito/vaciar');
  }

  aplicarCupon(codigo: string): Observable<Carrito> {
    const request: AplicarCuponCarritoRequest = { codigo };
    return this.api.post<Carrito>('/Carrito/cupon', request);
  }

  quitarCupon(): Observable<Carrito> {
    return this.api.delete<Carrito>('/Carrito/cupon');
  }

  crearPedido(): Observable<CrearPedidoDesdeCarritoResponse> {
    return this.api.post<CrearPedidoDesdeCarritoResponse>('/Carrito/crear-pedido', {});
  }
}
