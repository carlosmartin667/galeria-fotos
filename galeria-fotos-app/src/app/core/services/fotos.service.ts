import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import {
  ActualizarFotoRequest,
  CrearFotoMetadataRequest,
  Foto,
  GenerarStorageKeyRequest,
  GenerarStorageKeyResponse
} from '../models/foto.models';
import { ApiHttpService } from './api-http.service';
import { extractItems } from './response-utils';

@Injectable({ providedIn: 'root' })
export class FotosService {
  private readonly api = inject(ApiHttpService);

  listByEvento(eventoId: string): Observable<Foto[]> {
    return this.api.get<Foto[] | { items?: Foto[]; data?: Foto[] }>(`/Fotos/evento/${eventoId}`).pipe(map(extractItems));
  }

  get(id: string): Observable<Foto> {
    return this.api.get<Foto>(`/Fotos/${id}`);
  }

  update(id: string, payload: ActualizarFotoRequest): Observable<Foto> {
    return this.api.put<Foto>(`/Fotos/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/Fotos/${id}`);
  }

  generateStorageKey(payload: GenerarStorageKeyRequest): Observable<GenerarStorageKeyResponse> {
    return this.api.post<GenerarStorageKeyResponse>('/Fotos/storage-key', payload);
  }

  createMetadata(payload: CrearFotoMetadataRequest): Observable<Foto> {
    return this.api.post<Foto>('/Fotos/metadata', payload);
  }
}
