import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ActualizarTestimonioAdminRequest, CrearTestimonioRequest, Testimonio } from '../models/testimonio.models';
import { ApiHttpService } from './api-http.service';
import { extractItems } from './response-utils';

type TestimoniosResponse = Testimonio[] | { items?: Testimonio[]; data?: Testimonio[]; value?: Testimonio[]; results?: Testimonio[] };

@Injectable({ providedIn: 'root' })
export class TestimoniosService {
  private readonly api = inject(ApiHttpService);

  getPublicos(): Observable<Testimonio[]> {
    return this.api.get<TestimoniosResponse>('/Testimonios').pipe(map(extractItems));
  }

  getDestacados(): Observable<Testimonio[]> {
    return this.api.get<TestimoniosResponse>('/Testimonios/destacados').pipe(map(extractItems));
  }

  crear(request: CrearTestimonioRequest): Observable<Testimonio> {
    return this.api.post<Testimonio>('/Testimonios', request);
  }

  getAdmin(): Observable<Testimonio[]> {
    return this.api.get<TestimoniosResponse>('/Testimonios/admin').pipe(map(extractItems));
  }

  getAdminById(id: string): Observable<Testimonio> {
    return this.api.get<Testimonio>(`/Testimonios/admin/${id}`);
  }

  actualizarAdmin(id: string, request: ActualizarTestimonioAdminRequest): Observable<Testimonio> {
    return this.api.put<Testimonio>(`/Testimonios/${id}`, request);
  }

  eliminar(id: string): Observable<void> {
    return this.api.delete<void>(`/Testimonios/${id}`);
  }

  publicar(id: string): Observable<Testimonio> {
    return this.api.post<Testimonio>(`/Testimonios/${id}/publicar`, {});
  }

  ocultar(id: string): Observable<Testimonio> {
    return this.api.post<Testimonio>(`/Testimonios/${id}/ocultar`, {});
  }
}
