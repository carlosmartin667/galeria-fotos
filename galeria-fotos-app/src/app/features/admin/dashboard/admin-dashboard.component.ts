import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { finalize } from 'rxjs';

import { AdminDashboard, AdminDashboardValue } from '../../../core/models/admin.models';
import { AdminService } from '../../../core/services/admin.service';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

interface DashboardMetric {
  label: string;
  value: string | number;
  icon: string;
}

interface DashboardSection {
  title: string;
  items: Record<string, unknown>[];
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [ErrorAlertComponent, LoadingComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly cdr = inject(ChangeDetectorRef);

  dashboard: AdminDashboard | null = null;
  metrics: DashboardMetric[] = [];
  sections: DashboardSection[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.adminService
      .getDashboard()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (dashboard) => {
          this.dashboard = dashboard;
          this.metrics = this.buildMetrics(dashboard);
          this.sections = this.buildSections(dashboard);
        },
        error: (error: unknown) => {
          this.error =
            error instanceof Error ? error.message : 'No se pudo cargar el dashboard admin.';
        },
      });
  }

  itemTitle(item: Record<string, unknown>): string {
    return String(
      this.firstValue(item, [
        'nombre',
        'nombreArchivo',
        'titulo',
        'clienteNombre',
        'email',
        'id',
        'pedidoId',
        'fotoId',
        'paqueteId',
      ]) ?? 'Registro',
    );
  }

  itemMeta(item: Record<string, unknown>): string {
    const values = [
      'estado',
      'total',
      'cantidad',
      'precio',
      'eventoId',
      'clienteId',
      'fechaCreacionUtc',
    ]
      .map((key) => this.firstValue(item, [key]))
      .filter((value) => value !== undefined && value !== null && value !== '');

    return values.map((value) => String(value)).join(' - ');
  }

  trackByMetric(_: number, metric: DashboardMetric): string {
    return metric.label;
  }

  trackBySection(_: number, section: DashboardSection): string {
    return section.title;
  }

  trackByItem(index: number, item: Record<string, unknown>): string {
    return String(item['id'] ?? item['pedidoId'] ?? item['fotoId'] ?? item['paqueteId'] ?? index);
  }

  private buildMetrics(dashboard: AdminDashboard): DashboardMetric[] {
    return [
      {
        label: 'Eventos activos',
        value: this.metricValue(dashboard, ['eventosActivos', 'EventosActivos']),
        icon: 'fas fa-calendar-check',
      },
      {
        label: 'Fotos subidas',
        value: this.metricValue(dashboard, ['fotosSubidas', 'FotosSubidas']),
        icon: 'fas fa-images',
      },
      {
        label: 'Pedidos pendientes',
        value: this.metricValue(dashboard, ['pedidosPendientes', 'PedidosPendientes']),
        icon: 'fas fa-clock',
      },
      {
        label: 'Pedidos pagados',
        value: this.metricValue(dashboard, ['pedidosPagados', 'PedidosPagados']),
        icon: 'fas fa-receipt',
      },
      {
        label: 'Ingresos del mes',
        value: this.metricValue(dashboard, [
          'ingresosDelMes',
          'ingresosMes',
          'IngresosDelMes',
          'IngresosMes',
        ]),
        icon: 'fas fa-chart-line',
      },
      {
        label: 'Clientes registrados',
        value: this.metricValue(dashboard, ['clientesRegistrados', 'ClientesRegistrados']),
        icon: 'fas fa-users',
      },
      {
        label: 'Sesiones privadas activas',
        value: this.metricValue(dashboard, ['sesionesPrivadasActivas', 'SesionesPrivadasActivas']),
        icon: 'fas fa-camera-retro',
      },
    ].filter((metric) => metric.value !== '-');
  }

  private buildSections(dashboard: AdminDashboard): DashboardSection[] {
    return [
      {
        title: 'Ultimos pedidos',
        items: this.readList(dashboard, ['ultimosPedidos', 'UltimosPedidos']),
      },
      {
        title: 'Fotos mas compradas',
        items: this.readList(dashboard, ['fotosMasCompradas', 'FotosMasCompradas']),
      },
      {
        title: 'Paquetes mas vendidos',
        items: this.readList(dashboard, ['paquetesMasVendidos', 'PaquetesMasVendidos']),
      },
    ].filter((section) => section.items.length > 0);
  }

  private metricValue(dashboard: AdminDashboard, keys: string[]): string | number {
    const value = this.firstValue(dashboard as Record<string, unknown>, keys);
    return typeof value === 'number' || typeof value === 'string' ? value : '-';
  }

  private readList(dashboard: AdminDashboard, keys: string[]): Record<string, unknown>[] {
    const value = this.firstValue(dashboard as Record<string, unknown>, keys);

    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter(
      (item): item is Record<string, unknown> =>
        !!item && typeof item === 'object' && !Array.isArray(item),
    );
  }

  private firstValue(item: Record<string, unknown>, keys: string[]): AdminDashboardValue | unknown {
    const normalized = new Map(Object.keys(item).map((key) => [key.toLowerCase(), key]));
    const matchingKey = keys.map((key) => normalized.get(key.toLowerCase())).find(Boolean);
    return matchingKey ? item[matchingKey] : undefined;
  }
}
