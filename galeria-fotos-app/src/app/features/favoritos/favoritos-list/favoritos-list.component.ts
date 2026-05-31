import { DatePipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

import { FavoritoEventoResponse, FavoritoFotoResponse } from '../../../core/models/favorito.models';
import { FavoritosService } from '../../../core/services/favoritos.service';
import { SessionService } from '../../../core/services/session.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-favoritos-list',
  standalone: true,
  imports: [DatePipe, NgFor, NgIf, RouterLink, EmptyStateComponent, ErrorAlertComponent, LoadingComponent],
  templateUrl: './favoritos-list.component.html'
})
export class FavoritosListComponent implements OnInit {
  private readonly favoritosService = inject(FavoritosService);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly session = inject(SessionService);

  eventos: FavoritoEventoResponse[] = [];
  fotos: FavoritoFotoResponse[] = [];
  loading = false;
  error = '';
  success = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      eventos: this.favoritosService.listEventos(),
      fotos: this.favoritosService.listFotos()
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: ({ eventos, fotos }) => {
        this.eventos = eventos;
        this.fotos = fotos;
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudieron cargar los favoritos.';
      }
    });
  }

  removeEvento(eventoId: string): void {
    this.favoritosService.removeEvento(eventoId).subscribe({
      next: () => {
        this.success = 'Evento quitado de favoritos.';
        this.load();
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo quitar el favorito.';
        this.cdr.markForCheck();
      }
    });
  }

  removeFoto(fotoId: string): void {
    this.favoritosService.removeFoto(fotoId).subscribe({
      next: () => {
        this.success = 'Foto quitada de favoritos.';
        this.load();
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo quitar el favorito.';
        this.cdr.markForCheck();
      }
    });
  }

  trackEvento(_: number, item: FavoritoEventoResponse): string {
    return item.id || item.eventoId;
  }

  trackFoto(_: number, item: FavoritoFotoResponse): string {
    return item.id || item.fotoId;
  }
}
