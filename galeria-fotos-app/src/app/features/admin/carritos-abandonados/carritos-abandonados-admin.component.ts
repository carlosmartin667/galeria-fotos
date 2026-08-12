import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { finalize, forkJoin } from 'rxjs';

import {
  CarritoAbandonadoRegistro,
  CarritoAbandonadoResumen,
} from '../../../core/models/carrito-abandonado.models';
import { CarritosAbandonadosService } from '../../../core/services/carritos-abandonados.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-carritos-abandonados-admin',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    NgClass,
    EmptyStateComponent,
    ErrorAlertComponent,
    LoadingComponent,
  ],
  templateUrl: './carritos-abandonados-admin.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './carritos-abandonados-admin.component.css',
})
export class CarritosAbandonadosAdminComponent implements OnInit {
  private readonly service = inject(CarritosAbandonadosService);
  private readonly cdr = inject(ChangeDetectorRef);

  resumen: CarritoAbandonadoResumen | null = null;
  registros: CarritoAbandonadoRegistro[] = [];
  loading = false;
  detecting = false;
  actionId = '';
  error = '';
  success = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    forkJoin({
      resumen: this.service.getResumen(),
      registros: this.service.getAbandonados(),
    })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: ({ resumen, registros }) => {
          this.resumen = resumen;
          this.registros = [...registros].sort(
            (a, b) =>
              new Date(
                b.fechaAbandonoUtc ?? b.fechaDeteccionUtc ?? b.fechaCreacionUtc ?? '',
              ).getTime() -
              new Date(
                a.fechaAbandonoUtc ?? a.fechaDeteccionUtc ?? a.fechaCreacionUtc ?? '',
              ).getTime(),
          );
        },
        error: (error: unknown) => {
          this.error =
            error instanceof Error ? error.message : 'No se pudieron cargar carritos abandonados.';
        },
      });
  }

  detectar(): void {
    this.detecting = true;
    this.error = '';
    this.success = '';

    this.service
      .detectar()
      .pipe(
        finalize(() => {
          this.detecting = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.success = 'Deteccion ejecutada.';
          this.load();
        },
        error: (error: unknown) => {
          this.error =
            error instanceof Error ? error.message : 'No se pudo detectar carritos abandonados.';
        },
      });
  }

  notificar(item: CarritoAbandonadoRegistro): void {
    if (!item.id) {
      return;
    }

    this.actionId = item.id;
    this.error = '';
    this.success = '';
    this.service
      .notificar(item.id)
      .pipe(
        finalize(() => {
          this.actionId = '';
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.success = 'Recordatorio solicitado.';
          this.load();
        },
        error: (error: unknown) => {
          this.error = this.notificationMessage(error);
        },
      });
  }

  estadoClass(estado?: string | null): string {
    const normalized = (estado ?? '').toLowerCase();
    if (normalized.includes('recuper')) {
      return 'bg-success';
    }
    if (normalized.includes('notific')) {
      return 'bg-info text-dark';
    }
    if (normalized.includes('bloque') || normalized.includes('cancel')) {
      return 'bg-secondary';
    }
    return 'bg-warning text-dark';
  }

  resumenValue(keys: (keyof CarritoAbandonadoResumen)[]): number {
    const source = this.resumen ?? {};
    const value = keys
      .map((key) => source[key])
      .find((item) => item !== null && item !== undefined);
    return Number(value ?? 0);
  }

  trackById(index: number, item: CarritoAbandonadoRegistro): string {
    return item.id ?? String(index);
  }

  private notificationMessage(error: unknown): string {
    const message = error instanceof Error ? error.message : '';
    const normalized = message.toLowerCase();
    if (
      normalized.includes('spam') ||
      normalized.includes('bloque') ||
      normalized.includes('limite')
    ) {
      return 'El backend bloqueo el recordatorio para evitar spam o por limite de envios.';
    }
    return message || 'No se pudo notificar el carrito abandonado.';
  }
}
