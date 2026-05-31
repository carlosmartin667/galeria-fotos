import { CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Foto } from '../../../core/models/foto.models';
import { FotosService } from '../../../core/services/fotos.service';
import { SessionService } from '../../../core/services/session.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-fotos-list',
  standalone: true,
  imports: [CurrencyPipe, NgFor, NgIf, RouterLink, EmptyStateComponent, ErrorAlertComponent, LoadingComponent],
  templateUrl: './fotos-list.component.html'
})
export class FotosListComponent implements OnInit {
  private readonly fotosService = inject(FotosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly session = inject(SessionService);

  eventoId = '';
  fotos: Foto[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    this.eventoId = this.route.snapshot.paramMap.get('eventoId') ?? '';

    if (this.eventoId) {
      this.load();
    }
  }

  searchByValue(value: string): void {
    const eventoId = value.trim();

    if (eventoId) {
      void this.router.navigate(['/fotos/evento', eventoId]);
      return;
    }

    this.error = 'Ingresa un eventoId para consultar las fotos.';
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.fotosService.listByEvento(this.eventoId).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (fotos) => {
        this.fotos = fotos;
      },
      error: (error: unknown) => {
        this.error = this.message(error);
        this.cdr.markForCheck();
      }
    });
  }

  deleteFoto(foto: Foto): void {
    if (!this.session.canWrite) {
      this.error = 'Esta accion requiere iniciar sesion.';
      return;
    }

    if (!confirm(`Eliminar foto "${foto.nombreArchivo}"?`)) {
      return;
    }

    this.fotosService.delete(foto.id).subscribe({
      next: () => this.load(),
      error: (error: unknown) => {
        this.error = this.message(error);
      }
    });
  }

  trackById(_: number, foto: Foto): string {
    return foto.id;
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'No se pudieron cargar las fotos.';
  }
}
