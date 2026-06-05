import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import {
  CuponMasUsado,
  ReporteVentasResumen,
  TopProducto,
  VentaPorDia,
  VentaPorEstado,
  VentaPorTipoItem,
} from '../../../core/models/reporte-ventas.models';
import { ReportesService } from '../../../core/services/reportes.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

interface TopProductGroup {
  title: string;
  items: TopProducto[];
}

@Component({
  selector: 'app-reportes-ventas-admin',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    EmptyStateComponent,
    ErrorAlertComponent,
    LoadingComponent,
  ],
  templateUrl: './reportes-ventas-admin.component.html',
  styleUrl: './reportes-ventas-admin.component.css',
})
export class ReportesVentasAdminComponent implements OnInit {
  private readonly reportesService = inject(ReportesService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  reporte: ReporteVentasResumen | null = null;
  loading = false;
  error = '';

  readonly filtros = this.fb.nonNullable.group({
    desde: [''],
    hasta: [''],
  });

  ngOnInit(): void {
    this.load();
  }

  get ventasPorDia(): VentaPorDia[] {
    return this.reporte?.ventasPorDia ?? [];
  }

  get ventasPorEstado(): VentaPorEstado[] {
    return this.reporte?.ventasPorEstado ?? [];
  }

  get ventasPorTipoItem(): VentaPorTipoItem[] {
    return this.reporte?.ventasPorTipoItem ?? [];
  }

  get topEventos(): TopProducto[] {
    return this.reporte?.topEventos ?? [];
  }

  get topFotos(): TopProducto[] {
    return this.reporte?.topFotos ?? [];
  }

  get topPaquetes(): TopProducto[] {
    return this.reporte?.topPaquetes ?? [];
  }

  get cuponesMasUsados(): CuponMasUsado[] {
    return this.reporte?.cuponesMasUsados ?? [];
  }

  get topGroups(): TopProductGroup[] {
    return [
      { title: 'Top eventos', items: this.topEventos },
      { title: 'Top fotos', items: this.topFotos },
      { title: 'Top paquetes', items: this.topPaquetes },
    ];
  }

  load(): void {
    this.loading = true;
    this.error = '';
    const raw = this.filtros.getRawValue();

    this.reportesService
      .getVentasResumen(this.toIso(raw.desde), this.toIso(raw.hasta))
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (reporte) => {
          this.reporte = reporte;
        },
        error: (error: unknown) => {
          this.error =
            error instanceof Error ? error.message : 'No se pudo cargar el reporte de ventas.';
        },
      });
  }

  clear(): void {
    this.filtros.reset({ desde: '', hasta: '' });
    this.load();
  }

  trackByIndex(index: number): number {
    return index;
  }

  productName(item: TopProducto): string {
    return item.nombre || item.titulo || item.productoId || item.id || '-';
  }

  productTotal(item: TopProducto): number {
    return Number(item.total ?? item.ingresos ?? 0);
  }

  private toIso(value: string): string | undefined {
    return value ? new Date(`${value}T00:00:00`).toISOString() : undefined;
  }
}
