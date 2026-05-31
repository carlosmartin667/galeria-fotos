import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiHttpService } from './api-http.service';
import {
  ActualizarFotoRequestDto,
  ApiListResponse,
  CrearFotoMetadataRequestDto,
  Foto,
  GenerarStorageKeyRequestDto,
  Uuid,
  extractItems
} from './models';

@Injectable({ providedIn: 'root' })
export class FotosService {
  private readonly api = inject(ApiHttpService);

  listByEvento(eventoId: Uuid): Observable<Foto[]> {
    return this.api.get<ApiListResponse<Foto>>(`/Fotos/evento/${eventoId}`).pipe(map(extractItems));
  }

  get(id: Uuid): Observable<Foto> {
    return this.api.get<Foto>(`/Fotos/${id}`);
  }

  update(id: Uuid, payload: ActualizarFotoRequestDto): Observable<Foto> {
    return this.api.put<Foto>(`/Fotos/${id}`, payload);
  }

  delete(id: Uuid): Observable<void> {
    return this.api.delete<void>(`/Fotos/${id}`);
  }

  generateStorageKey(payload: GenerarStorageKeyRequestDto): Observable<{ storageKey?: string; key?: string }> {
    return this.api.post<{ storageKey?: string; key?: string }>('/Fotos/storage-key', payload);
  }

  createMetadata(payload: CrearFotoMetadataRequestDto): Observable<Foto> {
    return this.api.post<Foto>('/Fotos/metadata', payload);
  }
}
