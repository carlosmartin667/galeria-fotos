import { CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ClienteHistorial } from '../../../core/models/cliente-historial.models';
import { ClienteHistorialService } from '../../../core/services/cliente-historial.service';
import { SessionService } from '../../../core/services/session.service';
import { isSensitiveKey, redactSensitiveText } from '../../../core/utils/sensitive-text';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { NotasInternasComponent } from '../../../shared/components/notas-internas/notas-internas.component';

interface HistorialTab {
  key: string;
  label: string;
}

interface SafeEntry {
  key: string;
  value: string;
}

@Component({
  selector: 'app-cliente-historial',
  standalone: true,
  imports: [
    CurrencyPipe,
    RouterLink,
    EmptyStateComponent,
    ErrorAlertComponent,
    LoadingComponent,
    NotasInternasComponent,
  ],
  templateUrl: './cliente-historial.component.html',
  styleUrl: './cliente-historial.component.css',
})
export class ClienteHistorialComponent implements OnInit {
  private readonly historialService = inject(ClienteHistorialService);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly session = inject(SessionService);

  readonly tabs: HistorialTab[] = [
    { key: 'pedidos', label: 'Pedidos' },
    { key: 'pagos', label: 'Pagos' },
    { key: 'descargas', label: 'Descargas' },
    { key: 'eventos', label: 'Eventos' },
    { key: 'sesionesPrivadas', label: 'Sesiones privadas' },
    { key: 'solicitudesPresupuesto', label: 'Solicitudes' },
    { key: 'agenda', label: 'Agenda' },
    { key: 'favoritos', label: 'Favoritos' },
    { key: 'comentarios', label: 'Comentarios' },
  ];

  historial: ClienteHistorial | null = null;
  activeTab = 'pedidos';
  loading = false;
  error = '';

  ngOnInit(): void {
    this.load();
  }

  get isMiHistorial(): boolean {
    return !this.route.snapshot.paramMap.get('id');
  }

  load(): void {
    const clienteId = this.route.snapshot.paramMap.get('id');
    this.loading = true;
    this.error = '';

    const request = clienteId
      ? this.historialService.getHistorialCliente(clienteId)
      : this.historialService.getMiHistorial();

    request
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (historial) => {
          this.historial = historial;
        },
        error: (error: unknown) => {
          this.error = error instanceof Error ? error.message : 'No se pudo cargar el historial.';
        },
      });
  }

  sectionItems(key: string): Record<string, unknown>[] {
    const value = this.historial?.[key];
    return Array.isArray(value)
      ? value.filter(
          (item): item is Record<string, unknown> =>
            !!item && typeof item === 'object' && !Array.isArray(item),
        )
      : [];
  }

  safeEntries(item: Record<string, unknown>): SafeEntry[] {
    return Object.entries(item)
      .filter(([key, value]) => this.isSafeKey(key) && this.isRenderable(value))
      .map(([key, value]) => ({ key: this.label(key), value: this.value(value) }))
      .slice(0, 10);
  }

  itemTitle(item: Record<string, unknown>): string {
    return String(
      this.firstValue(item, ['nombre', 'titulo', 'estado', 'id', 'pedidoId', 'tipoEvento']) ??
        'Registro',
    );
  }

  totalNumber(keys: string[]): number {
    const value = this.firstValue(this.historial?.totales ?? {}, keys);
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  totalText(keys: string[]): string {
    const value = this.firstValue(this.historial?.totales ?? {}, keys);
    return value ? String(value) : '-';
  }

  clienteId(): string {
    return this.historial?.cliente?.id ?? this.route.snapshot.paramMap.get('id') ?? '';
  }

  trackByKey(_: number, tab: HistorialTab): string {
    return tab.key;
  }

  trackByIndex(index: number): number {
    return index;
  }

  private isSafeKey(key: string): boolean {
    const normalized = key.toLowerCase();
    return (
      !isSensitiveKey(key) && !['url', 'firma'].some((blocked) => normalized.includes(blocked))
    );
  }

  private isRenderable(value: unknown): boolean {
    return (
      value !== null &&
      value !== undefined &&
      ['string', 'number', 'boolean'].includes(typeof value)
    );
  }

  private value(value: unknown): string {
    if (typeof value === 'boolean') {
      return value ? 'Si' : 'No';
    }

    return redactSensitiveText(value);
  }

  private label(key: string): string {
    return key
      .replace(/Utc$/i, '')
      .replace(/Id$/i, ' ID')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/^./, (value) => value.toUpperCase());
  }

  private firstValue(item: Record<string, unknown>, keys: string[]): unknown {
    const normalized = new Map(Object.keys(item).map((key) => [key.toLowerCase(), key]));
    const matchingKey = keys.map((key) => normalized.get(key.toLowerCase())).find(Boolean);
    return matchingKey ? item[matchingKey] : undefined;
  }
}
