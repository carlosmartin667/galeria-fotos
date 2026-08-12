import { CurrencyPipe, PercentPipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AdminVentasResumen, TopProducto } from '../../../core/models/reporte-ventas.models';
import { ReportesService } from '../../../core/services/reportes.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

interface SalesMetric {
  label: string;
  value: number;
  icon: string;
  currency?: boolean;
  percent?: boolean;
}

@Component({
  selector: 'app-ventas-admin',
  standalone: true,
  imports: [
    CurrencyPipe,
    PercentPipe,
    RouterLink,
    EmptyStateComponent,
    ErrorAlertComponent,
    LoadingComponent,
  ],
  templateUrl: './ventas-admin.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './ventas-admin.component.css',
})
export class VentasAdminComponent implements OnInit {
  private readonly reportesService = inject(ReportesService);
  private readonly cdr = inject(ChangeDetectorRef);

  resumen: AdminVentasResumen | null = null;
  loading = false;
  error = '';

  ngOnInit(): void {
    this.load();
  }

  get metrics(): SalesMetric[] {
    const item = this.resumen ?? {};
    return [
      {
        label: 'Ventas mes',
        value: Number(item.ventasMes ?? 0),
        icon: 'fas fa-dollar-sign',
        currency: true,
      },
      {
        label: 'Mes anterior',
        value: Number(item.ventasMesAnterior ?? 0),
        icon: 'fas fa-history',
        currency: true,
      },
      {
        label: 'Crecimiento',
        value: Number(item.crecimientoPorcentual ?? 0),
        icon: 'fas fa-chart-line',
        percent: true,
      },
      {
        label: 'Carritos abandonados',
        value: Number(item.carritosAbandonados ?? 0),
        icon: 'fas fa-shopping-cart',
      },
      {
        label: 'Carritos recuperados',
        value: Number(item.carritosRecuperados ?? 0),
        icon: 'fas fa-undo',
      },
      {
        label: 'Cupones activos',
        value: Number(item.cuponesActivos ?? 0),
        icon: 'fas fa-ticket-alt',
      },
      {
        label: 'Promociones activas',
        value: Number(item.promocionesActivas ?? 0),
        icon: 'fas fa-tags',
      },
      {
        label: 'Testimonios pendientes',
        value: Number(item.testimoniosPendientes ?? 0),
        icon: 'fas fa-comment-dots',
      },
    ];
  }

  get topGroups(): { title: string; items: TopProducto[] }[] {
    return [
      { title: 'Productos mas vendidos', items: this.resumen?.productosMasVendidos ?? [] },
      { title: 'Fotos mas vendidas', items: this.resumen?.fotosMasVendidas ?? [] },
      { title: 'Paquetes mas vendidos', items: this.resumen?.paquetesMasVendidos ?? [] },
      { title: 'Eventos mas vendidos', items: this.resumen?.eventosMasVendidos ?? [] },
    ];
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.reportesService
      .getAdminVentasResumen()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (resumen) => {
          this.resumen = resumen;
        },
        error: (error: unknown) => {
          this.error =
            error instanceof Error ? error.message : 'No se pudo cargar el resumen comercial.';
        },
      });
  }

  productName(item: TopProducto): string {
    return item.nombre || item.titulo || item.productoId || item.id || '-';
  }

  productTotal(item: TopProducto): number {
    return Number(item.total ?? item.ingresos ?? 0);
  }

  trackByLabel(_: number, item: SalesMetric): string {
    return item.label;
  }

  trackByTitle(_: number, item: { title: string }): string {
    return item.title;
  }

  trackByProduct(index: number, item: TopProducto): string {
    return item.id ?? item.productoId ?? String(index);
  }
}
