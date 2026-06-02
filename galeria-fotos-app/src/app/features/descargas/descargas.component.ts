import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Descarga, RegenerarDescargaResponse } from '../../core/models/descarga.models';
import { DescargasService } from '../../core/services/descargas.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

@Component({
  selector: 'app-descargas',
  standalone: true,
  imports: [DatePipe, NgClass, NgFor, NgIf, RouterLink, EmptyStateComponent, ErrorAlertComponent, LoadingComponent],
  templateUrl: './descargas.component.html',
  styleUrl: './descargas.component.css'
})
export class DescargasComponent implements OnInit {
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

    this.descargasService.getMisDescargas().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (descargas) => {
        this.descargas = descargas;
      },
      error: (error: unknown) => {
        this.error = this.message(error);
      }
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
      }
    });
  }

  tipo(descarga: Descarga): string {
    if (descarga.fotoPrivadaId) {
      return 'Foto privada';
    }

    if (descarga.fotoId) {
      return 'Foto evento';
    }

    return 'Pedido';
  }

  expira(descarga: Descarga): string | undefined {
    return descarga.expiraEnUtc ?? descarga.expiresAtUtc;
  }

  isExpired(descarga: Descarga): boolean {
    const expira = this.expira(descarga);
    return Boolean(expira && new Date(expira).getTime() <= Date.now());
  }

  limitReached(descarga: Descarga): boolean {
    return descarga.maxDescargas !== null
      && descarga.maxDescargas !== undefined
      && Number(descarga.descargasRealizadas ?? 0) >= Number(descarga.maxDescargas);
  }

  statusBadges(descarga: Descarga): Array<{ label: string; className: string }> {
    const badges = [
      {
        label: descarga.activa === false ? 'Inactiva' : 'Activa',
        className: descarga.activa === false ? 'bg-secondary' : 'bg-success'
      },
      {
        label: this.isExpired(descarga) ? 'Vencida' : 'Vigente',
        className: this.isExpired(descarga) ? 'bg-danger' : 'bg-primary'
      }
    ];

    if (descarga.maxDescargas === null || descarga.maxDescargas === undefined) {
      badges.push({ label: 'Sin limite', className: 'bg-light text-dark border' });
    } else if (this.limitReached(descarga)) {
      badges.push({ label: 'Limite alcanzado', className: 'bg-warning text-dark' });
    }

    return badges;
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
        activa: true
      };
    });
  }

  private message(error: unknown): string {
    const message = error instanceof Error ? error.message : '';
    const normalized = message.toLowerCase();

    if (normalized.includes('pagado')) {
      return 'El pedido todavia no esta pagado. Solo se pueden descargar fotos de pedidos pagados.';
    }

    if (normalized.includes('limite') || normalized.includes('limit') || normalized.includes('max')) {
      return 'Se alcanzo el limite de descargas permitido para este link.';
    }

    if (normalized.includes('venc') || normalized.includes('expir')) {
      return 'El link de descarga esta vencido. Regenera el link para continuar.';
    }

    if (normalized.includes('permiso') || normalized.includes('forbidden') || normalized.includes('403')) {
      return 'No tenes permisos para acceder a esta descarga.';
    }

    if (normalized.includes('comprada') || normalized.includes('compra')) {
      return 'La foto no pertenece a una compra habilitada para descarga.';
    }

    return message || 'No se pudieron cargar las descargas.';
  }
}
