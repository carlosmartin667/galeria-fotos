import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

import {
  AdminOperacionesPendientes,
  AdminOperacionesResumen,
} from '../../../core/models/operaciones.models';
import { OperacionesService } from '../../../core/services/operaciones.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

interface OperacionMetric {
  label: string;
  value: string | number;
  icon: string;
  link: string;
}

interface OperacionSection {
  title: string;
  items: Record<string, unknown>[];
  empty: string;
}

@Component({
  selector: 'app-operaciones-admin',
  standalone: true,
  imports: [RouterLink, EmptyStateComponent, ErrorAlertComponent, LoadingComponent],
  templateUrl: './operaciones-admin.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './operaciones-admin.component.css',
})
export class OperacionesAdminComponent implements OnInit {
  private readonly operacionesService = inject(OperacionesService);
  private readonly cdr = inject(ChangeDetectorRef);

  resumen: AdminOperacionesResumen | null = null;
  pendientes: AdminOperacionesPendientes | null = null;
  metrics: OperacionMetric[] = [];
  sections: OperacionSection[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      resumen: this.operacionesService.getResumen(),
      pendientes: this.operacionesService.getPendientes(),
    })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: ({ resumen, pendientes }) => {
          this.resumen = resumen;
          this.pendientes = pendientes;
          this.metrics = this.buildMetrics(resumen);
          this.sections = this.buildSections(resumen, pendientes);
        },
        error: (error: unknown) => {
          this.error =
            error instanceof Error ? error.message : 'No se pudo cargar el panel operativo.';
        },
      });
  }

  itemTitle(item: Record<string, unknown>): string {
    return String(
      this.firstValue(item, [
        'nombre',
        'titulo',
        'clienteNombre',
        'email',
        'estado',
        'id',
        'pedidoId',
      ]) ?? 'Registro',
    );
  }

  itemMeta(item: Record<string, unknown>): string {
    return [
      'estado',
      'tipo',
      'total',
      'fechaCreacionUtc',
      'fechaInicioUtc',
      'fechaSesionUtc',
      'expiraEnUtc',
    ]
      .map((key) => this.firstValue(item, [key]))
      .filter((value) => value !== undefined && value !== null && value !== '')
      .map((value) => String(value))
      .join(' - ');
  }

  trackByTitle(index: number, item: OperacionSection | OperacionMetric): string {
    return 'title' in item ? item.title : `${item.label}-${index}`;
  }

  trackByItem(index: number, item: Record<string, unknown>): string {
    return String(item['id'] ?? item['pedidoId'] ?? index);
  }

  private buildMetrics(resumen: AdminOperacionesResumen): OperacionMetric[] {
    return [
      {
        label: 'Solicitudes nuevas',
        value: this.metric(resumen, ['solicitudesNuevas']),
        icon: 'fas fa-file-signature',
        link: '/admin/presupuestos',
      },
      {
        label: 'Pendientes contacto',
        value: this.metric(resumen, ['solicitudesPendientesContacto']),
        icon: 'fas fa-phone',
        link: '/admin/presupuestos',
      },
      {
        label: 'Pedidos pendientes pago',
        value: this.metric(resumen, ['pedidosPendientesPago']),
        icon: 'fas fa-clock',
        link: '/admin/pedidos',
      },
      {
        label: 'Pedidos pagados',
        value: this.metric(resumen, ['pedidosPagados']),
        icon: 'fas fa-receipt',
        link: '/admin/pedidos',
      },
      {
        label: 'Preparando descarga',
        value: this.metric(resumen, ['pedidosPreparandoDescarga']),
        icon: 'fas fa-box-open',
        link: '/admin/pedidos',
      },
      {
        label: 'Listos para descargar',
        value: this.metric(resumen, ['pedidosListosParaDescargar']),
        icon: 'fas fa-download',
        link: '/admin/descargas',
      },
      {
        label: 'Sesiones activas',
        value: this.metric(resumen, ['sesionesPrivadasActivas']),
        icon: 'fas fa-camera-retro',
        link: '/admin/sesiones-privadas',
      },
      {
        label: 'Eventos proximos',
        value: this.metric(resumen, ['eventosProximos']),
        icon: 'fas fa-calendar-alt',
        link: '/admin/eventos',
      },
      {
        label: 'Descargas vencidas',
        value: this.metric(resumen, ['descargasVencidas']),
        icon: 'fas fa-exclamation-triangle',
        link: '/admin/descargas',
      },
      {
        label: 'Descargas por vencer',
        value: this.metric(resumen, ['descargasPorVencer']),
        icon: 'fas fa-hourglass-half',
        link: '/admin/descargas',
      },
    ];
  }

  private buildSections(
    resumen: AdminOperacionesResumen,
    pendientes: AdminOperacionesPendientes,
  ): OperacionSection[] {
    return [
      {
        title: 'Pedidos recientes',
        items: this.list(resumen, ['pedidosRecientes']),
        empty: 'No hay pedidos recientes.',
      },
      {
        title: 'Solicitudes recientes',
        items: this.list(resumen, ['solicitudesRecientes']),
        empty: 'No hay solicitudes recientes.',
      },
      {
        title: 'Agenda proxima',
        items: this.list(pendientes, ['agendaProxima'])
          .concat(this.list(resumen, ['agendaProxima']))
          .slice(0, 8),
        empty: 'No hay agenda proxima.',
      },
      {
        title: 'Pendientes operativos',
        items: this.mergePendientes(pendientes),
        empty: 'No hay pendientes operativos.',
      },
      {
        title: 'Descargas vencidas o por vencer',
        items: this.list(pendientes, ['descargasVencidas']).concat(
          this.list(pendientes, ['descargasPorVencer']),
        ),
        empty: 'No hay descargas vencidas.',
      },
    ];
  }

  private mergePendientes(pendientes: AdminOperacionesPendientes): Record<string, unknown>[] {
    return [
      ...this.list(pendientes, ['pedidosPendientes']),
      ...this.list(pendientes, ['pedidosPagados']),
      ...this.list(pendientes, ['pedidosPreparandoDescarga']),
      ...this.list(pendientes, ['solicitudesPendientes']),
      ...this.list(pendientes, ['sesionesPrivadasActivas']),
    ].slice(0, 12);
  }

  private metric(item: Record<string, unknown>, keys: string[]): string | number {
    const value = this.firstValue(item, keys);
    return typeof value === 'number' || typeof value === 'string' ? value : 0;
  }

  private list(item: Record<string, unknown>, keys: string[]): Record<string, unknown>[] {
    const value = this.firstValue(item, keys);
    return Array.isArray(value)
      ? value.filter(
          (entry): entry is Record<string, unknown> =>
            !!entry && typeof entry === 'object' && !Array.isArray(entry),
        )
      : [];
  }

  private firstValue(item: Record<string, unknown>, keys: string[]): unknown {
    const normalized = new Map(Object.keys(item).map((key) => [key.toLowerCase(), key]));
    const matchingKey = keys.map((key) => normalized.get(key.toLowerCase())).find(Boolean);
    return matchingKey ? item[matchingKey] : undefined;
  }
}
