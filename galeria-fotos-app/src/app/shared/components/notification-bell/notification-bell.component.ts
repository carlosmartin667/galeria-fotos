import { DatePipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Notificacion } from '../../../core/models/notificacion.models';
import { NotificacionesService } from '../../../core/services/notificaciones.service';
import { SessionService } from '../../../core/services/session.service';
import { redactSensitiveText } from '../../../core/utils/sensitive-text';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [DatePipe, NgClass, RouterLink],
  templateUrl: './notification-bell.component.html',
  styleUrl: './notification-bell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationBellComponent implements OnInit {
  private readonly notificacionesService = inject(NotificacionesService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  readonly session = inject(SessionService);

  notificaciones: Notificacion[] = [];
  open = false;
  loading = false;
  error = '';

  ngOnInit(): void {
    if (this.session.isAuthenticated) {
      this.load();
    }
  }

  get unreadCount(): number {
    return this.notificaciones.filter((item) => item.leida !== true).length;
  }

  get latest(): Notificacion[] {
    return this.notificaciones.slice(0, 5);
  }

  load(): void {
    if (!this.session.isAuthenticated) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.notificacionesService.getMisNotificaciones().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (items) => {
        this.notificaciones = this.sort(items);
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudieron cargar notificaciones.';
      }
    });
  }

  toggle(): void {
    this.open = !this.open;
  }

  marcarLeida(item: Notificacion): void {
    if (item.leida || !item.id) {
      return;
    }

    this.notificacionesService.marcarLeida(item.id).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.notificaciones = this.notificaciones.map((current) =>
          current.id === item.id ? { ...current, leida: true, fechaLecturaUtc: new Date().toISOString() } : current
        );
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo marcar como leida.';
        this.cdr.markForCheck();
      }
    });
  }

  marcarTodas(): void {
    this.notificacionesService.marcarTodasLeidas().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        const now = new Date().toISOString();
        this.notificaciones = this.notificaciones.map((item) => ({ ...item, leida: true, fechaLecturaUtc: item.fechaLecturaUtc ?? now }));
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudieron marcar todas como leidas.';
        this.cdr.markForCheck();
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

  private sort(items: Notificacion[]): Notificacion[] {
    return [...items].sort((a, b) => new Date(b.fechaCreacionUtc ?? '').getTime() - new Date(a.fechaCreacionUtc ?? '').getTime());
  }
}
