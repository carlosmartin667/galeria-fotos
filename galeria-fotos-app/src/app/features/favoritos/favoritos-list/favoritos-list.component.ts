import { DatePipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { FavoritoEventoResponse, FavoritoFotoResponse } from '../../../core/models/favorito.models';
import { PaginationQuery } from '../../../core/models/pagination.models';
import { FavoritosService } from '../../../core/services/favoritos.service';
import { SessionService } from '../../../core/services/session.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PaginationControlsComponent } from '../../../shared/components/pagination-controls/pagination-controls.component';

@Component({
  selector: 'app-favoritos-list',
  standalone: true,
  imports: [DatePipe, FormsModule, NgFor, NgIf, RouterLink, EmptyStateComponent, ErrorAlertComponent, LoadingComponent, PaginationControlsComponent],
  templateUrl: './favoritos-list.component.html'
})
export class FavoritosListComponent implements OnInit {
  private readonly favoritosService = inject(FavoritosService);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly session = inject(SessionService);

  eventos: FavoritoEventoResponse[] = [];
  fotos: FavoritoFotoResponse[] = [];
  eventosSearch = '';
  fotosSearch = '';
  eventosPagination: PaginationQuery = { page: 1, pageSize: 10, all: false };
  fotosPagination: PaginationQuery = { page: 1, pageSize: 10, all: false };
  eventosTotalItems = 0;
  eventosTotalPages = 1;
  eventosHasPreviousPage = false;
  eventosHasNextPage = false;
  fotosTotalItems = 0;
  fotosTotalPages = 1;
  fotosHasPreviousPage = false;
  fotosHasNextPage = false;
  eventosLoading = false;
  fotosLoading = false;
  error = '';
  eventosError = '';
  fotosError = '';
  success = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.error = '';
    this.loadEventos();
    this.loadFotos();
  }

  loadEventos(): void {
    this.eventosLoading = true;
    this.eventosError = '';

    this.favoritosService.getEventosFavoritosPaginados(this.eventosPagination).pipe(
      finalize(() => {
        this.eventosLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (response) => {
        this.eventos = response.items;
        this.eventosPagination = {
          page: response.page,
          pageSize: response.pageSize || this.eventosPagination.pageSize,
          all: response.all
        };
        this.eventosTotalItems = response.totalItems;
        this.eventosTotalPages = response.totalPages;
        this.eventosHasPreviousPage = response.hasPreviousPage;
        this.eventosHasNextPage = response.hasNextPage;
      },
      error: (error: unknown) => {
        this.eventosError = error instanceof Error ? error.message : 'No se pudieron cargar los eventos favoritos.';
      }
    });
  }

  loadFotos(): void {
    this.fotosLoading = true;
    this.fotosError = '';

    this.favoritosService.getFotosFavoritasPaginadas(this.fotosPagination).pipe(
      finalize(() => {
        this.fotosLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (response) => {
        this.fotos = response.items;
        this.fotosPagination = {
          page: response.page,
          pageSize: response.pageSize || this.fotosPagination.pageSize,
          all: response.all
        };
        this.fotosTotalItems = response.totalItems;
        this.fotosTotalPages = response.totalPages;
        this.fotosHasPreviousPage = response.hasPreviousPage;
        this.fotosHasNextPage = response.hasNextPage;
      },
      error: (error: unknown) => {
        this.fotosError = error instanceof Error ? error.message : 'No se pudieron cargar las fotos favoritas.';
      }
    });
  }

  get filteredEventos(): FavoritoEventoResponse[] {
    const term = this.normalize(this.eventosSearch);

    return this.eventos.filter((item) => !term || [
      item.id,
      item.eventoId,
      item.nombreEvento,
      item.fechaEventoUtc
    ].some((value) => this.normalize(value).includes(term)));
  }

  get filteredFotos(): FavoritoFotoResponse[] {
    const term = this.normalize(this.fotosSearch);

    return this.fotos.filter((item) => !term || [
      item.id,
      item.fotoId,
      item.eventoId,
      item.nombreArchivo
    ].some((value) => this.normalize(value).includes(term)));
  }

  onEventosPaginationChange(query: PaginationQuery): void {
    this.eventosPagination = query;
    this.loadEventos();
  }

  onFotosPaginationChange(query: PaginationQuery): void {
    this.fotosPagination = query;
    this.loadFotos();
  }

  removeEvento(eventoId: string): void {
    this.favoritosService.removeEvento(eventoId).subscribe({
      next: () => {
        this.success = 'Evento quitado de favoritos.';
        this.loadEventos();
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
        this.loadFotos();
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

  private normalize(value: unknown): string {
    return String(value ?? '').trim().toLowerCase();
  }
}
