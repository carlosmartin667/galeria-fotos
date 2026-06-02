import { DatePipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Promocion } from '../../../core/models/promocion.models';
import { PromocionesService } from '../../../core/services/promociones.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-promociones-list',
  standalone: true,
  imports: [DatePipe, NgFor, NgIf, RouterLink, EmptyStateComponent, ErrorAlertComponent, LoadingComponent],
  templateUrl: './promociones-list.component.html',
  styleUrl: './promociones-list.component.css'
})
export class PromocionesListComponent implements OnInit {
  private readonly promocionesService = inject(PromocionesService);
  private readonly cdr = inject(ChangeDetectorRef);

  promociones: Promocion[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.promocionesService.getPublicas().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (items) => {
        this.promociones = [...items].sort((a, b) => Number(a.orden ?? 0) - Number(b.orden ?? 0));
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudieron cargar promociones.';
      }
    });
  }

  ctaLink(item: Promocion): string {
    if (item.servicioFotografiaId) {
      return `/servicios/${item.servicioFotografiaId}`;
    }
    if (item.eventoId) {
      return `/eventos/${item.eventoId}`;
    }
    return '/presupuesto';
  }

  couponCode(item: Promocion): string {
    return item.cuponCodigo || item.codigoCupon || '';
  }

  trackById(index: number, item: Promocion): string {
    return item.id ?? String(index);
  }
}
