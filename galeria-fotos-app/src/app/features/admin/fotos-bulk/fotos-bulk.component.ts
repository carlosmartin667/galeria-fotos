import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { Evento } from '../../../core/models/evento.models';
import {
  CrearFotoMetadataBulkResponse,
  GenerarStorageKeysBulkResponse,
  StorageKeyBulkItem,
} from '../../../core/models/foto.models';
import { EventosService } from '../../../core/services/eventos.service';
import { FotosService } from '../../../core/services/fotos.service';
import { redactSensitiveText, technicalReference } from '../../../core/utils/sensitive-text';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-fotos-bulk',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, ErrorAlertComponent, LoadingComponent],
  templateUrl: './fotos-bulk.component.html',
  styleUrl: './fotos-bulk.component.css',
})
export class FotosBulkComponent implements OnInit {
  private readonly eventosService = inject(EventosService);
  private readonly fotosService = inject(FotosService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  eventos: Evento[] = [];
  generatedItems: StorageKeyBulkItem[] = [];
  storageResponse: GenerarStorageKeysBulkResponse | null = null;
  metadataResponse: CrearFotoMetadataBulkResponse | null = null;
  loadingEventos = false;
  generating = false;
  creating = false;
  error = '';
  success = '';

  readonly form = this.fb.nonNullable.group({
    eventoId: ['', Validators.required],
    nombresArchivo: ['', Validators.required],
    contentType: ['image/jpeg', [Validators.required, Validators.maxLength(120)]],
    precioUnitario: [0, Validators.required],
    sizeInBytes: [0],
    previewBaseUrl: [''],
    tieneMarcaAgua: [false],
    procesada: [false],
  });

  ngOnInit(): void {
    this.loadEventos();
  }

  get nombresArchivo(): string[] {
    return this.form.controls.nombresArchivo
      .getRawValue()
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  loadEventos(): void {
    this.loadingEventos = true;
    this.eventosService
      .list()
      .pipe(
        finalize(() => {
          this.loadingEventos = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (eventos) => {
          this.eventos = eventos;
        },
        error: (error: unknown) => {
          this.error =
            error instanceof Error ? error.message : 'No se pudieron cargar los eventos.';
        },
      });
  }

  generarStorageKeys(): void {
    this.error = '';
    this.success = '';
    this.metadataResponse = null;

    const eventoId = this.form.controls.eventoId.getRawValue();
    const nombresArchivo = this.nombresArchivo;

    if (!eventoId || nombresArchivo.length === 0) {
      this.error = 'Selecciona un evento y agrega al menos un nombre de archivo.';
      return;
    }

    this.generating = true;
    this.fotosService.generarStorageKeysBulk({ eventoId, nombresArchivo }).subscribe({
      next: (response) => {
        this.storageResponse = response;
        this.generatedItems = this.normalizeStorageKeys(response, nombresArchivo);
        this.generating = false;
        this.success = `Storage keys generadas: ${this.generatedItems.filter((item) => this.storageKeyOf(item)).length}.`;
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.error =
          error instanceof Error ? error.message : 'No se pudieron generar las storage keys.';
        this.generating = false;
        this.cdr.markForCheck();
      },
    });
  }

  crearMetadataBulk(): void {
    this.error = '';
    this.success = '';

    const raw = this.form.getRawValue();
    const fotos = this.generatedItems
      .map((item, index) => ({
        eventoId: raw.eventoId,
        nombreArchivo: this.fileNameOf(item) || this.nombresArchivo[index] || '',
        contentType: raw.contentType.trim(),
        storageKey: this.storageKeyOf(item),
        previewUrl: this.previewUrl(
          raw.previewBaseUrl,
          this.fileNameOf(item) || this.nombresArchivo[index] || '',
        ),
        sizeInBytes: Number(raw.sizeInBytes || 0),
        precioUnitario: Number(raw.precioUnitario || 0),
        tieneMarcaAgua: raw.tieneMarcaAgua,
        procesada: raw.procesada,
      }))
      .filter((item) => item.nombreArchivo && item.storageKey);

    if (fotos.length === 0) {
      this.error = 'Primero genera storage keys validas para crear metadata.';
      return;
    }

    this.creating = true;
    this.fotosService.crearMetadataBulk({ fotos }).subscribe({
      next: (response) => {
        this.metadataResponse = response;
        this.creating = false;
        this.success = 'Metadata bulk procesada.';
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo crear metadata bulk.';
        this.creating = false;
        this.cdr.markForCheck();
      },
    });
  }

  storageKeyOf(item: StorageKeyBulkItem): string {
    return String(item.storageKey ?? item.key ?? item['StorageKey'] ?? item['Key'] ?? '');
  }

  storageKeyPreview(item: StorageKeyBulkItem): string {
    return technicalReference(this.storageKeyOf(item));
  }

  fileNameOf(item: StorageKeyBulkItem): string {
    return String(
      item.nombreArchivo ?? item['NombreArchivo'] ?? item['archivo'] ?? item['Archivo'] ?? '',
    );
  }

  responseValue(
    response: GenerarStorageKeysBulkResponse | CrearFotoMetadataBulkResponse | null,
    key: string,
  ): string | number {
    if (!response) {
      return '-';
    }

    const matchingKey = Object.keys(response).find(
      (item) => item.toLowerCase() === key.toLowerCase(),
    );
    const value = matchingKey ? response[matchingKey] : undefined;
    return typeof value === 'number' || typeof value === 'string' ? value : '-';
  }

  errores(
    response: GenerarStorageKeysBulkResponse | CrearFotoMetadataBulkResponse | null,
  ): unknown[] {
    if (!response) {
      return [];
    }

    const value =
      response.errores ?? response['Errores'] ?? response['errors'] ?? response['Errors'];
    return Array.isArray(value) ? value : [];
  }

  errorText(value: unknown): string {
    return redactSensitiveText(value);
  }

  trackEvento(_: number, evento: Evento): string {
    return evento.id;
  }

  trackStorageItem(index: number, item: StorageKeyBulkItem): string {
    return this.fileNameOf(item) || String(index);
  }

  trackError(index: number): number {
    return index;
  }

  private normalizeStorageKeys(
    response: GenerarStorageKeysBulkResponse,
    nombresArchivo: string[],
  ): StorageKeyBulkItem[] {
    const raw = response as unknown;

    if (Array.isArray(raw)) {
      return raw.filter((item): item is StorageKeyBulkItem => !!item && typeof item === 'object');
    }

    const record = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
    const arrayKey = [
      'items',
      'Items',
      'resultados',
      'Resultados',
      'storageKeys',
      'StorageKeys',
      'data',
      'Data',
      'results',
      'Results',
    ].find((key) => Array.isArray(record[key]));

    if (arrayKey) {
      return (record[arrayKey] as unknown[]).filter(
        (item): item is StorageKeyBulkItem => !!item && typeof item === 'object',
      );
    }

    const mapValue = record['storageKeys'] ?? record['StorageKeys'];
    if (mapValue && typeof mapValue === 'object' && !Array.isArray(mapValue)) {
      return Object.entries(mapValue as Record<string, unknown>).map(
        ([nombreArchivo, storageKey]) => ({ nombreArchivo, storageKey: String(storageKey ?? '') }),
      );
    }

    return nombresArchivo.map((nombreArchivo) => ({ nombreArchivo }));
  }

  private previewUrl(base: string, nombreArchivo: string): string | undefined {
    const cleanBase = base.trim().replace(/\/$/, '');
    return cleanBase && nombreArchivo
      ? `${cleanBase}/${encodeURIComponent(nombreArchivo)}`
      : undefined;
  }
}
