import { DatePipe, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Promocion } from '../../../core/models/promocion.models';
import { PromocionesService } from '../../../core/services/promociones.service';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-promocion-detail',
  standalone: true,
  imports: [DatePipe, NgIf, RouterLink, ErrorAlertComponent, LoadingComponent],
  templateUrl: './promocion-detail.component.html',
  styleUrl: './promocion-detail.component.css'
})
export class PromocionDetailComponent implements OnInit {
  private readonly promocionesService = inject(PromocionesService);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  promocion: Promocion | null = null;
  loading = false;
  error = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    if (!id) {
      this.error = 'Promocion no encontrada.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.promocionesService.getById(id).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (item) => {
        this.promocion = item;
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo cargar la promocion.';
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
}
