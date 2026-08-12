import { DatePipe, NgClass } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Descarga, RegenerarDescargaResponse } from '../../../core/models/descarga.models';
import { DescargasService } from '../../../core/services/descargas.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-admin-descargas',
  standalone: true,
  imports: [
    DatePipe,
    NgClass,
    RouterLink,
    EmptyStateComponent,
    ErrorAlertComponent,
    LoadingComponent,
  ],
  templateUrl: './admin-descargas.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './admin-descargas.component.css',
})
export class AdminDescargasComponent implements OnInit {
  private readonly descargasService = inject(DescargasService);
  private readonly cdr = inject(ChangeDetectorRef);

  descargas: Descarga[] = [];
  loading = false;
  regeneratingId = '';
  error = '';
  success = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.descargasService
      .getDescargasAdmin()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (descargas) => {
          this.descargas = descargas;
        },
        error: (error: unknown) => {
          this.error = this.message(error);
        },
      });
  }

  regenerar(descarga: Descarga): void {
    this.regeneratingId = descarga.id;
    this.error = '';
    this.success = '';

    this.descargasService.regenerarDescarga(descarga.id).subscribe({
      next: (response) => {
        this.applyRegenerated(descarga.id, response);
        this.success = 'Link de descarga regenerado correctamente.';
        this.regeneratingId = '';
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.error = this.message(error);
        this.regeneratingId = '';
        this.cdr.markForCheck();
      },
    });
  }

  owner(descarga: Descarga): string {
    return (
      descarga.clienteNombre ||
      descarga.clienteEmail ||
      descarga.usuarioNombre ||
      descarga.usuarioEmail ||
      descarga.clienteId ||
      descarga.usuarioId ||
      '-'
    );
  }

  expira(descarga: Descarga): string | undefined {
    return descarga.expiraEnUtc ?? descarga.expiresAtUtc;
  }

  isExpired(descarga: Descarga): boolean {
    const expira = this.expira(descarga);
    return Boolean(expira && new Date(expira).getTime() <= Date.now());
  }

  limitReached(descarga: Descarga): boolean {
    return (
      descarga.maxDescargas !== null &&
      descarga.maxDescargas !== undefined &&
      Number(descarga.descargasRealizadas ?? 0) >= Number(descarga.maxDescargas)
    );
  }

  badgeClass(descarga: Descarga): string {
    if (descarga.activa === false) {
      return 'bg-secondary';
    }

    if (this.isExpired(descarga) || this.limitReached(descarga)) {
      return 'bg-warning text-dark';
    }

    return 'bg-success';
  }

  trackById(_: number, descarga: Descarga): string {
    return descarga.id;
  }

  private applyRegenerated(id: string, response: RegenerarDescargaResponse): void {
    this.descargas = this.descargas.map((descarga) => {
      if (descarga.id !== id) {
        return descarga;
      }

      return {
        ...descarga,
        url: response.url ?? descarga.url,
        expiraEnUtc: response.expiraEnUtc ?? response.expiresAtUtc ?? descarga.expiraEnUtc,
        maxDescargas: response.maxDescargas ?? descarga.maxDescargas,
        descargasRealizadas: response.descargasRealizadas ?? descarga.descargasRealizadas,
        ultimaDescargaUtc: response.ultimaDescargaUtc ?? descarga.ultimaDescargaUtc,
        activa: true,
      };
    });
  }

  private message(error: unknown): string {
    const message = error instanceof Error ? error.message : '';
    const normalized = message.toLowerCase();

    if (
      normalized.includes('permiso') ||
      normalized.includes('forbidden') ||
      normalized.includes('403')
    ) {
      return 'No tenes permisos para gestionar descargas.';
    }

    if (
      normalized.includes('limite') ||
      normalized.includes('limit') ||
      normalized.includes('max')
    ) {
      return 'Se alcanzo el limite de descargas permitido para este link.';
    }

    if (normalized.includes('venc') || normalized.includes('expir')) {
      return 'El link de descarga esta vencido. Regenera el link para continuar.';
    }

    return message || 'No se pudieron cargar las descargas admin.';
  }
}
