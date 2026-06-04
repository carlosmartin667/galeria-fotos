import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Notificacion } from '../../../../core/models/notificacion.models';
import { NotificacionesService } from '../../../../core/services/notificaciones.service';
import { redactSensitiveText } from '../../../../core/utils/sensitive-text';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-notificaciones-admin',
  standalone: true,
  imports: [DatePipe, NgClass, NgFor, NgIf, RouterLink, ReactiveFormsModule, EmptyStateComponent, ErrorAlertComponent, LoadingComponent],
  templateUrl: './notificaciones-admin.component.html',
  styleUrl: './notificaciones-admin.component.css'
})
export class NotificacionesAdminComponent implements OnInit {
  private readonly notificacionesService = inject(NotificacionesService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  notificaciones: Notificacion[] = [];
  loading = false;
  actionId = '';
  error = '';
  success = '';

  readonly filtros = this.fb.nonNullable.group({
    estado: [''],
    canal: [''],
    tipo: [''],
    activa: ['all'],
    take: [50]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.success = '';
    const raw = this.filtros.getRawValue();

    this.notificacionesService.getAdmin({
      estado: raw.estado || null,
      canal: raw.canal || null,
      tipo: raw.tipo || null,
      activa: this.activaParam(raw.activa),
      take: Number(raw.take || 50)
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (items) => {
        this.notificaciones = [...items].sort((a, b) => new Date(b.fechaCreacionUtc ?? '').getTime() - new Date(a.fechaCreacionUtc ?? '').getTime());
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudieron cargar notificaciones admin.';
      }
    });
  }

  reenviar(item: Notificacion): void {
    if (!item.id) {
      return;
    }

    this.actionId = item.id;
    this.notificacionesService.reenviar(item.id).pipe(
      finalize(() => {
        this.actionId = '';
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.success = 'Notificacion reenviada.';
        this.load();
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo reenviar la notificacion.';
      }
    });
  }

  cancelar(item: Notificacion): void {
    if (!item.id || !confirm('Cancelar esta notificacion?')) {
      return;
    }

    this.actionId = item.id;
    this.notificacionesService.cancelar(item.id).pipe(
      finalize(() => {
        this.actionId = '';
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.success = 'Notificacion cancelada.';
        this.load();
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo cancelar la notificacion.';
      }
    });
  }

  text(value: unknown): string {
    return redactSensitiveText(value);
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

  private activaParam(value: string): boolean | null {
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
    return null;
  }
}
