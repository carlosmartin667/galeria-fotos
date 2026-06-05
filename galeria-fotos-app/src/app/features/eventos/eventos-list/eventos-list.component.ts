import { DatePipe, NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Evento } from '../../../core/models/evento.models';
import { PaginationQuery } from '../../../core/models/pagination.models';
import { EventosService } from '../../../core/services/eventos.service';
import { FotosService } from '../../../core/services/fotos.service';
import { SessionService } from '../../../core/services/session.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PaginationControlsComponent } from '../../../shared/components/pagination-controls/pagination-controls.component';

@Component({
  selector: 'app-eventos-list',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    NgClass,
    RouterLink,
    EmptyStateComponent,
    ErrorAlertComponent,
    LoadingComponent,
    PaginationControlsComponent,
  ],
  templateUrl: './eventos-list.component.html',
  styleUrl: './eventos-list.component.css',
})
export class EventosListComponent implements OnInit {
  private readonly eventosService = inject(EventosService);
  private readonly fotosService = inject(FotosService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  readonly session = inject(SessionService);

  eventos: Evento[] = [];
  eventPreviewUrls: Record<string, string | null> = {};
  private readonly eventPreviewLoading = new Set<string>();
  searchTerm = '';
  estadoFilter = 'Todos';
  readonly estadoOptions = ['Todos', 'Publicado', 'Borrador', 'Finalizado', 'Archivado', 'Activo'];
  pagination: PaginationQuery = { page: 1, pageSize: 10, all: false };
  totalItems = 0;
  totalPages = 1;
  hasPreviousPage = false;
  hasNextPage = false;
  loading = false;
  error = '';

  ngOnInit(): void {
    this.load();
  }

  get isAdminRoute(): boolean {
    const url = this.router.url.split('?')[0];
    return url === '/admin' || url.startsWith('/admin/');
  }

  eventosPath(): string {
    return this.isAdminRoute ? '/admin/eventos' : '/eventos';
  }

  fotosEventoPath(): string {
    return this.isAdminRoute ? '/admin/fotos/evento' : '/fotos/evento';
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.eventosService
      .getEventosPaginados(this.pagination)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response) => {
          this.eventos = response.items;
          this.pagination = {
            page: response.page,
            pageSize: response.pageSize || this.pagination.pageSize,
            all: response.all,
          };
          this.totalItems = response.totalItems;
          this.totalPages = response.totalPages;
          this.hasPreviousPage = response.hasPreviousPage;
          this.hasNextPage = response.hasNextPage;
          this.loadEventPreviews(response.items);
        },
        error: (error: unknown) => {
          this.error = this.message(error);
          this.cdr.markForCheck();
        },
      });
  }

  get filteredEventos(): Evento[] {
    const term = this.normalize(this.searchTerm);
    const estado = this.normalize(this.estadoFilter);

    return this.eventos.filter((evento) => {
      const matchesSearch =
        !term ||
        [evento.nombre, evento.descripcion, evento.estado, evento.clientePrincipalId].some(
          (value) => this.normalize(value).includes(term),
        );
      const matchesEstado =
        this.estadoFilter === 'Todos' || this.normalize(evento.estado) === estado;
      return matchesSearch && matchesEstado;
    });
  }

  onPaginationChange(query: PaginationQuery): void {
    this.pagination = query;
    this.load();
  }

  deleteEvento(evento: Evento): void {
    if (!this.session.isAdmin) {
      this.error = 'No tenes permisos para realizar esta accion.';
      return;
    }

    if (!confirm(`Eliminar evento "${evento.nombre}"?`)) {
      return;
    }

    this.eventosService.delete(evento.id).subscribe({
      next: () => this.load(),
      error: (error: unknown) => {
        this.error = this.message(error);
      },
    });
  }

  trackById(_: number, evento: Evento): string {
    return evento.id;
  }

  hasCachedPreview(eventoId: string): boolean {
    return eventoId in this.eventPreviewUrls;
  }

  badgeClass(
    value: string | undefined,
    kind: 'estado' | 'visibilidad' | 'activo' = 'estado',
  ): string {
    const normalized = this.normalize(value);

    if (kind === 'activo') {
      return normalized === 'true' ? 'bg-success' : 'bg-secondary';
    }

    if (['publicado', 'publico'].includes(normalized)) {
      return 'bg-success';
    }

    if (['borrador', 'privado'].includes(normalized)) {
      return 'bg-warning text-dark';
    }

    if (['finalizado'].includes(normalized)) {
      return 'bg-primary';
    }

    if (['archivado', 'oculto'].includes(normalized)) {
      return 'bg-secondary';
    }

    return 'bg-light text-dark border';
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'No se pudieron cargar los eventos.';
  }

  private normalize(value: unknown): string {
    return String(value ?? '')
      .trim()
      .toLowerCase();
  }

  private loadEventPreviews(eventos: Evento[]): void {
    eventos.forEach((evento) => {
      if (this.hasCachedPreview(evento.id) || this.eventPreviewLoading.has(evento.id)) {
        return;
      }

      const portadaUrl = this.portadaUrl(evento);
      if (portadaUrl) {
        this.eventPreviewUrls[evento.id] = portadaUrl;
        return;
      }

      this.eventPreviewLoading.add(evento.id);

      if (evento.portadaFotoId) {
        this.fotosService.get(evento.portadaFotoId).subscribe({
          next: (foto) => {
            this.eventPreviewUrls[evento.id] = foto.previewUrl ?? null;
            this.finishEventPreview(evento.id);
          },
          error: () => {
            this.eventPreviewUrls[evento.id] = null;
            this.finishEventPreview(evento.id);
          },
        });
        return;
      }

      this.fotosService
        .getFotosPorEventoPaginado(evento.id, { page: 1, pageSize: 5, all: false })
        .subscribe({
          next: (response) => {
            this.eventPreviewUrls[evento.id] =
              response.items.find((foto) => Boolean(foto.previewUrl))?.previewUrl ?? null;
            this.finishEventPreview(evento.id);
          },
          error: () => {
            this.eventPreviewUrls[evento.id] = null;
            this.finishEventPreview(evento.id);
          },
        });
    });
  }

  private portadaUrl(evento: Evento): string {
    return evento.portadaPreviewUrl ?? evento.portadaFotoPreviewUrl ?? evento.portadaUrl ?? '';
  }

  private finishEventPreview(eventoId: string): void {
    this.eventPreviewLoading.delete(eventoId);
    this.cdr.markForCheck();
  }
}
