import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ActualizarPortfolioItemRequest, CrearPortfolioItemRequest, PortfolioItem } from '../models/portfolio.models';
import { ApiHttpService } from './api-http.service';
import { extractItems } from './response-utils';

type PortfolioResponse = PortfolioItem[] | { items?: PortfolioItem[]; data?: PortfolioItem[]; value?: PortfolioItem[]; results?: PortfolioItem[] };

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly api = inject(ApiHttpService);

  getPublicos(): Observable<PortfolioItem[]> {
    return this.api.get<PortfolioResponse>('/Portfolio').pipe(map(extractItems));
  }

  getById(id: string): Observable<PortfolioItem> {
    return this.api.get<PortfolioItem>(`/Portfolio/${id}`);
  }

  getAdmin(): Observable<PortfolioItem[]> {
    return this.api.get<PortfolioResponse>('/Portfolio/admin').pipe(map(extractItems));
  }

  crear(request: CrearPortfolioItemRequest): Observable<PortfolioItem> {
    return this.api.post<PortfolioItem>('/Portfolio', request);
  }

  actualizar(id: string, request: ActualizarPortfolioItemRequest): Observable<PortfolioItem> {
    return this.api.put<PortfolioItem>(`/Portfolio/${id}`, request);
  }

  eliminar(id: string): Observable<void> {
    return this.api.delete<void>(`/Portfolio/${id}`);
  }
}
