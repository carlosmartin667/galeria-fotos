import { NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Notificacion } from '../../../../core/models/notificacion.models';
import { NotificacionesService } from '../../../../core/services/notificaciones.service';
import { isSensitiveKey, redactSensitiveText } from '../../../../core/utils/sensitive-text';
import { ErrorAlertComponent } from '../../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';

interface DetailEntry {
  key: string;
  value: string;
}

@Component({
  selector: 'app-notificacion-detail-admin',
  standalone: true,
  imports: [NgClass, NgFor, NgIf, RouterLink, ErrorAlertComponent, LoadingComponent],
  templateUrl: './notificacion-detail-admin.component.html',
  styleUrl: './notificacion-detail-admin.component.css'
})
export class NotificacionDetailAdminComponent implements OnInit {
  private readonly notificacionesService = inject(NotificacionesService);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  item: Notificacion | null = null;
  loading = false;
  actionLoading = false;
  error = '';
  success = '';

  ngOnInit(): void {
    this.load();
  }

  get entries(): DetailEntry[] {
    if (!this.item) {
      return [];
    }

    return Object.entries(this.item)
      .filter(([key, value]) => !isSensitiveKey(key) && value !== null && value !== undefined)
      .map(([key, value]) => ({ key: this.label(key), value: redactSensitiveText(value) }));
  }

  load(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    if (!id) {
      this.error = 'Notificacion no encontrada.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';
    this.notificacionesService.getAdminDetalle(id).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (item) => {
        this.item = item;
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo cargar la notificacion.';
      }
    });
  }

  reenviar(): void {
    if (!this.item?.id) {
      return;
    }

    this.actionLoading = true;
    this.notificacionesService.reenviar(this.item.id).pipe(
      finalize(() => {
        this.actionLoading = false;
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

  cancelar(): void {
    if (!this.item?.id || !confirm('Cancelar esta notificacion?')) {
      return;
    }

    this.actionLoading = true;
    this.notificacionesService.cancelar(this.item.id).pipe(
      finalize(() => {
        this.actionLoading = false;
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

  trackByKey(_: number, entry: DetailEntry): string {
    return entry.key;
  }

  private label(key: string): string {
    return key.replace(/Utc$/i, '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (value) => value.toUpperCase());
  }
}
