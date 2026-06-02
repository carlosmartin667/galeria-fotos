import { CurrencyPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { SESION_PRIVADA_ESTADOS, SesionPrivada } from '../../../core/models/sesion-privada.models';
import { SesionesPrivadasService } from '../../../core/services/sesiones-privadas.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { NotasInternasComponent } from '../../../shared/components/notas-internas/notas-internas.component';

@Component({
  selector: 'app-sesiones-privadas-admin',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgClass, NgFor, NgIf, FormsModule, EmptyStateComponent, ErrorAlertComponent, LoadingComponent, NotasInternasComponent],
  templateUrl: './sesiones-privadas-admin.component.html',
  styleUrl: './sesiones-privadas-admin.component.css'
})
export class SesionesPrivadasAdminComponent implements OnInit {
  private readonly sesionesService = inject(SesionesPrivadasService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly estados = SESION_PRIVADA_ESTADOS;
  sesiones: SesionPrivada[] = [];
  estadosPorSesion: Record<string, string> = {};
  comentariosPorSesion: Record<string, string> = {};
  selectedSesion: SesionPrivada | null = null;
  loading = false;
  savingId = '';
  error = '';
  success = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.sesionesService.list().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (sesiones) => {
        this.sesiones = sesiones;
        this.estadosPorSesion = sesiones.reduce<Record<string, string>>((acc, sesion) => {
          if (sesion.id) {
            acc[sesion.id] = sesion.estado || 'Borrador';
          }
          return acc;
        }, {});
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudieron cargar sesiones privadas.';
      }
    });
  }

  cambiarEstado(sesion: SesionPrivada): void {
    if (!sesion.id) {
      return;
    }

    const estado = this.estadosPorSesion[sesion.id] || sesion.estado || 'Borrador';
    const comentario = (this.comentariosPorSesion[sesion.id] ?? '').trim() || null;
    this.savingId = sesion.id;
    this.error = '';
    this.success = '';

    this.sesionesService.cambiarEstadoSesionPrivada(sesion.id, { estado, comentario }).pipe(
      finalize(() => {
        this.savingId = '';
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.success = 'Estado de sesion actualizado.';
        this.comentariosPorSesion[sesion.id ?? ''] = '';
        this.load();
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo cambiar el estado de la sesion.';
      }
    });
  }

  selectSesion(sesion: SesionPrivada): void {
    this.selectedSesion = sesion;
  }

  estadoClass(estado?: string | null): string {
    const normalized = (estado ?? '').toLowerCase();
    if (normalized.includes('public') || normalized.includes('final') || normalized.includes('lista')) {
      return 'bg-success';
    }
    if (normalized.includes('cancel')) {
      return 'bg-danger';
    }
    if (normalized.includes('edicion')) {
      return 'bg-info text-dark';
    }
    return 'bg-warning text-dark';
  }

  trackById(index: number, sesion: SesionPrivada): string {
    return sesion.id ?? String(index);
  }
}
