import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { catchError, finalize, forkJoin, of } from 'rxjs';

import { BitacoraItem, BitacoraListResponse, BitacoraSummaryCard } from '../../../core/models/bitacora.models';
import { BitacoraService } from '../../../core/services/bitacora.service';
import { redactSensitiveText, sanitizeMetadata } from '../../../core/utils/sensitive-text';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-bitacora-admin',
  standalone: true,
  imports: [DatePipe, NgClass, NgFor, NgIf, ReactiveFormsModule, EmptyStateComponent, ErrorAlertComponent, LoadingComponent],
  templateUrl: './bitacora-admin.component.html',
  styleUrl: './bitacora-admin.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BitacoraAdminComponent implements OnInit {
  private readonly bitacoraService = inject(BitacoraService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  bitacora = this.emptyResponse();
  resumenCards: BitacoraSummaryCard[] = [];
  selected: BitacoraItem | null = null;
  loading = false;
  detailLoading = false;
  error = '';
  detailError = '';

  readonly filtros = this.fb.nonNullable.group({
    desde: [''],
    hasta: [''],
    usuarioEmail: [''],
    accion: [''],
    entidadTipo: [''],
    entidadId: [''],
    severidad: [''],
    correlationId: [''],
    pageSize: [20]
  });

  ngOnInit(): void {
    this.load();
  }

  load(page = this.bitacora.page || 1): void {
    this.loading = true;
    this.error = '';
    this.detailError = '';
    const raw = this.filtros.getRawValue();
    const pageSize = Number(raw.pageSize || 20);

    forkJoin({
      bitacora: this.bitacoraService.getBitacora({
        desde: this.dateTime(raw.desde, false),
        hasta: this.dateTime(raw.hasta, true),
        usuarioEmail: raw.usuarioEmail.trim() || null,
        accion: raw.accion.trim() || null,
        entidadTipo: raw.entidadTipo.trim() || null,
        entidadId: raw.entidadId.trim() || null,
        severidad: raw.severidad.trim() || null,
        correlationId: raw.correlationId.trim() || null,
        page,
        pageSize
      }),
      resumen: this.bitacoraService.getResumen().pipe(catchError(() => of(null)))
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: ({ bitacora, resumen }) => {
        this.bitacora = bitacora;
        this.resumenCards = this.buildResumenCards(resumen);
        this.selected = bitacora.items[0] ?? null;
      },
      error: (error: unknown) => {
        this.bitacora = this.emptyResponse();
        this.selected = null;
        this.error = error instanceof Error ? error.message : 'No se pudo cargar la bitacora.';
      }
    });
  }

  applyFilters(): void {
    this.load(1);
  }

  clearFilters(): void {
    this.filtros.reset({
      desde: '',
      hasta: '',
      usuarioEmail: '',
      accion: '',
      entidadTipo: '',
      entidadId: '',
      severidad: '',
      correlationId: '',
      pageSize: 20
    });
    this.load(1);
  }

  previousPage(): void {
    if (this.bitacora.hasPreviousPage) {
      this.load(Math.max(this.bitacora.page - 1, 1));
    }
  }

  nextPage(): void {
    if (this.bitacora.hasNextPage) {
      this.load(this.bitacora.page + 1);
    }
  }

  viewDetail(item: BitacoraItem): void {
    if (!item.id) {
      this.selected = item;
      return;
    }

    this.detailLoading = true;
    this.detailError = '';
    this.selected = item;

    this.bitacoraService.getDetalle(item.id).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.detailLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (detail) => {
        this.selected = detail;
      },
      error: (error: unknown) => {
        this.detailError = error instanceof Error ? error.message : 'No se pudo cargar el detalle.';
      }
    });
  }

  fecha(item: BitacoraItem | null): string | null {
    return this.textValue(item, ['fechaUtc', 'fechaCreacionUtc', 'fechaActualizacionUtc', 'fecha', 'timestamp']);
  }

  usuario(item: BitacoraItem | null): string {
    return this.safeText(this.value(item, ['usuarioEmail', 'email', 'usuario', 'userName']) || '-');
  }

  accion(item: BitacoraItem | null): string {
    return this.safeText(this.value(item, ['accion', 'action', 'evento', 'tipo']) || '-');
  }

  entidad(item: BitacoraItem | null): string {
    const tipo = this.safeText(this.value(item, ['entidadTipo', 'entityType']) || '-');
    const id = this.safeText(this.value(item, ['entidadId', 'entityId']) || '');
    return id ? `${tipo} / ${id}` : tipo;
  }

  severidad(item: BitacoraItem | null): string {
    return this.safeText(this.value(item, ['severidad', 'severity', 'nivel']) || 'Info');
  }

  correlationId(item: BitacoraItem | null): string {
    return this.safeText(this.value(item, ['correlationId', 'correlationKey', 'traceId']) || '-');
  }

  mensaje(item: BitacoraItem | null): string {
    return this.safeText(this.value(item, ['mensaje', 'detalle', 'descripcion', 'message']) || '-');
  }

  metadata(item: BitacoraItem | null): string {
    const value = this.value(item, ['metadataJson', 'metadata', 'metadataSafe', 'datos', 'extra']);
    return sanitizeMetadata(value);
  }

  safeText(value: unknown): string {
    return redactSensitiveText(value);
  }

  severidadClass(value?: string | null): string {
    const normalized = (value ?? '').toLowerCase();

    if (normalized.includes('error') || normalized.includes('crit')) {
      return 'bg-danger';
    }

    if (normalized.includes('warn') || normalized.includes('advert')) {
      return 'bg-warning text-dark';
    }

    if (normalized.includes('debug') || normalized.includes('trace')) {
      return 'bg-secondary';
    }

    return 'bg-info text-dark';
  }

  trackById(index: number, item: BitacoraItem): string {
    return item.id || String(index);
  }

  trackByCard(index: number, item: BitacoraSummaryCard): string {
    return `${item.label}-${index}`;
  }

  private buildResumenCards(resumen: Record<string, unknown> | null): BitacoraSummaryCard[] {
    if (!resumen) {
      return [];
    }

    const cards: BitacoraSummaryCard[] = [];

    Object.entries(resumen).forEach(([key, value]) => {
      if (cards.length >= 8) {
        return;
      }

      if (typeof value === 'number' || typeof value === 'string') {
        cards.push({ label: this.label(key), value });
        return;
      }

      if (Array.isArray(value)) {
        cards.push({ label: this.label(key), value: value.length });
        return;
      }

      if (value && typeof value === 'object') {
        Object.entries(value as Record<string, unknown>).forEach(([innerKey, innerValue]) => {
          if (cards.length < 8 && (typeof innerValue === 'number' || typeof innerValue === 'string')) {
            cards.push({ label: `${this.label(key)} ${this.label(innerKey)}`, value: innerValue });
          }
        });
      }
    });

    return cards;
  }

  private value(item: BitacoraItem | null, keys: string[]): unknown {
    if (!item) {
      return null;
    }

    const record = item as unknown as Record<string, unknown>;
    const normalized = new Map(Object.keys(record).map((key) => [key.toLowerCase(), key]));
    const matchingKey = keys.map((key) => normalized.get(key.toLowerCase())).find(Boolean);
    return matchingKey ? record[matchingKey] : null;
  }

  private textValue(item: BitacoraItem | null, keys: string[]): string | null {
    const value = this.value(item, keys);
    return typeof value === 'string' || typeof value === 'number' ? String(value) : null;
  }

  private dateTime(value: string, endOfDay: boolean): string | null {
    if (!value) {
      return null;
    }

    const suffix = endOfDay ? 'T23:59:59' : 'T00:00:00';
    const date = new Date(`${value}${suffix}`);
    return Number.isNaN(date.getTime()) ? value : date.toISOString();
  }

  private label(value: string): string {
    return value
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .trim()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  private emptyResponse(): BitacoraListResponse {
    return {
      items: [],
      page: 1,
      pageSize: 20,
      totalItems: 0,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
      all: false
    };
  }
}
