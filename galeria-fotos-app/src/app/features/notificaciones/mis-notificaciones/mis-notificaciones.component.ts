import { DatePipe, NgClass } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { Notificacion } from '../../../core/models/notificacion.models';
import { NotificacionesService } from '../../../core/services/notificaciones.service';
import { redactSensitiveText } from '../../../core/utils/sensitive-text';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-mis-notificaciones',
  standalone: true,
  imports: [
    DatePipe,
    NgClass,
    ReactiveFormsModule,
    EmptyStateComponent,
    ErrorAlertComponent,
    LoadingComponent,
  ],
  templateUrl: './mis-notificaciones.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './mis-notificaciones.component.css',
})
export class MisNotificacionesComponent implements OnInit {
  private readonly notificacionesService = inject(NotificacionesService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  notificaciones: Notificacion[] = [];
  loading = false;
  error = '';
  success = '';

  readonly filtros = this.fb.nonNullable.group({
    lectura: ['all'],
    canal: [''],
    estado: [''],
    tipo: [''],
  });

  ngOnInit(): void {
    this.load();
  }

  get filtered(): Notificacion[] {
    const filtros = this.filtros.getRawValue();
    return this.notificaciones.filter((item) => {
      const lecturaOk =
        filtros.lectura === 'all' ||
        (filtros.lectura === 'read' && item.leida === true) ||
        (filtros.lectura === 'unread' && item.leida !== true);
      return (
        lecturaOk &&
        this.matches(item.canal, filtros.canal) &&
        this.matches(item.estado, filtros.estado) &&
        this.matches(item.tipo, filtros.tipo)
      );
    });
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.notificacionesService
      .getMisNotificaciones()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (items) => {
          this.notificaciones = [...items].sort(
            (a, b) =>
              new Date(b.fechaCreacionUtc ?? '').getTime() -
              new Date(a.fechaCreacionUtc ?? '').getTime(),
          );
        },
        error: (error: unknown) => {
          this.error =
            error instanceof Error ? error.message : 'No se pudieron cargar tus notificaciones.';
        },
      });
  }

  marcarLeida(item: Notificacion): void {
    if (item.leida || !item.id) {
      return;
    }

    this.notificacionesService.marcarLeida(item.id).subscribe({
      next: () => {
        this.success = 'Notificacion marcada como leida.';
        this.notificaciones = this.notificaciones.map((current) =>
          current.id === item.id ? { ...current, leida: true } : current,
        );
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo marcar como leida.';
        this.cdr.markForCheck();
      },
    });
  }

  marcarTodas(): void {
    this.notificacionesService.marcarTodasLeidas().subscribe({
      next: () => {
        this.success = 'Todas las notificaciones fueron marcadas como leidas.';
        this.notificaciones = this.notificaciones.map((item) => ({ ...item, leida: true }));
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.error =
          error instanceof Error ? error.message : 'No se pudieron marcar todas como leidas.';
        this.cdr.markForCheck();
      },
    });
  }

  text(value: unknown): string {
    return redactSensitiveText(value);
  }

  canalClass(canal?: string | null): string {
    const normalized = (canal ?? '').toLowerCase();
    return normalized.includes('email') ? 'bg-primary' : 'bg-light text-dark border';
  }

  estadoClass(estado?: string | null): string {
    const normalized = (estado ?? '').toLowerCase();
    if (normalized.includes('enviada') || normalized.includes('enviado')) {
      return 'bg-success';
    }
    if (normalized.includes('error')) {
      return 'bg-danger';
    }
    if (normalized.includes('cancel')) {
      return 'bg-secondary';
    }
    if (normalized.includes('proces')) {
      return 'bg-info text-dark';
    }
    return 'bg-warning text-dark';
  }

  trackById(index: number, item: Notificacion): string {
    return item.id ?? String(index);
  }

  private matches(value: string | null | undefined, filter: string): boolean {
    return !filter || (value ?? '').toLowerCase().includes(filter.trim().toLowerCase());
  }
}
