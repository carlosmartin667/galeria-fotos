import { CurrencyPipe, NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, finalize, forkJoin, of } from 'rxjs';

import { Evento } from '../../../core/models/evento.models';
import { Foto } from '../../../core/models/foto.models';
import { PaginationQuery } from '../../../core/models/pagination.models';
import { EventosService } from '../../../core/services/eventos.service';
import { FotosService } from '../../../core/services/fotos.service';
import { SessionService } from '../../../core/services/session.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { ImageLightboxComponent } from '../../../shared/components/image-lightbox/image-lightbox.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PaginationControlsComponent } from '../../../shared/components/pagination-controls/pagination-controls.component';

@Component({
  selector: 'app-fotos-list',
  standalone: true,
  imports: [
    CurrencyPipe,
    FormsModule,
    NgClass,
    RouterLink,
    EmptyStateComponent,
    ErrorAlertComponent,
    ImageLightboxComponent,
    LoadingComponent,
    PaginationControlsComponent,
  ],
  templateUrl: './fotos-list.component.html',
  styleUrl: './fotos-list.component.css',
})
export class FotosListComponent implements OnInit {
  private readonly fotosService = inject(FotosService);
  private readonly eventosService = inject(EventosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly session = inject(SessionService);

  eventoId = '';
  evento: Evento | null = null;
  fotos: Foto[] = [];
  searchTerm = '';
  activaFilter = 'todas';
  readonly activaOptions = [
    { value: 'todas', label: 'Todas' },
    { value: 'activas', label: 'Activas' },
    { value: 'inactivas', label: 'Inactivas' },
  ];
  pagination: PaginationQuery = { page: 1, pageSize: 10, all: false };
  totalItems = 0;
  totalPages = 1;
  hasPreviousPage = false;
  hasNextPage = false;
  lightboxImageUrl = '';
  lightboxTitle = '';
  lightboxOpen = false;
  coverLoadingId = '';
  loading = false;
  error = '';
  success = '';

  ngOnInit(): void {
    this.eventoId = this.route.snapshot.paramMap.get('eventoId') ?? '';

    if (this.eventoId) {
      this.load();
    }
  }

  searchByValue(value: string): void {
    const eventoId = value.trim();

    if (eventoId) {
      this.eventoId = eventoId;
      this.pagination = { page: 1, pageSize: this.pagination.pageSize, all: this.pagination.all };
      void this.router.navigate(['/fotos/evento', eventoId]);
      this.load();
      return;
    }

    this.error = 'Ingresa un eventoId para consultar las fotos.';
  }

  load(): void {
    if (!this.eventoId) {
      this.fotos = [];
      this.error = 'Ingresa un eventoId para consultar las fotos.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    forkJoin({
      fotos: this.fotosService.getFotosPorEventoPaginado(this.eventoId, this.pagination),
      evento: this.eventosService.get(this.eventoId).pipe(catchError(() => of(null))),
    })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: ({ fotos: response, evento }) => {
          this.evento = evento;
          this.fotos = response.items;
          this.pagination = {
            page: response.page,
            pageSize: response.pageSize || this.pagination.pageSize,
            all: response.all,
          };
          this.totalItems = response.totalItems;
          this.totalPages = response.totalPages;
          this.hasPreviousPage = response.hasPreviousPage;
          this.hasNextPage = response.hasNextPage;
        },
        error: (error: unknown) => {
          this.error = this.message(error);
          this.cdr.markForCheck();
        },
      });
  }

  get filteredFotos(): Foto[] {
    const term = this.normalize(this.searchTerm);

    return this.fotos.filter((foto) => {
      const matchesSearch =
        !term ||
        [foto.nombreArchivo, foto.contentType, foto.precioUnitario, foto.eventoId].some((value) =>
          this.normalize(value).includes(term),
        );
      const matchesActiva =
        !this.session.isAdmin ||
        this.activaFilter === 'todas' ||
        (this.activaFilter === 'activas' && foto.activa !== false) ||
        (this.activaFilter === 'inactivas' && foto.activa === false);
      return matchesSearch && matchesActiva;
    });
  }

  onPaginationChange(query: PaginationQuery): void {
    this.pagination = query;
    this.load();
  }

  openLightbox(foto: Foto): void {
    if (!foto.previewUrl) {
      return;
    }

    this.lightboxImageUrl = foto.previewUrl;
    this.lightboxTitle = foto.nombreArchivo;
    this.lightboxOpen = true;
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
  }

  isPortada(foto: Foto): boolean {
    return Boolean(this.evento?.portadaFotoId && this.evento.portadaFotoId === foto.id);
  }

  asignarPortada(foto: Foto): void {
    if (!this.session.isAdmin || !this.eventoId) {
      this.error = 'No tenes permisos para realizar esta accion.';
      return;
    }

    this.coverLoadingId = foto.id;
    this.error = '';
    this.success = '';

    this.eventosService.asignarPortada(this.eventoId, foto.id).subscribe({
      next: () => {
        this.coverLoadingId = '';
        this.success = 'Portada del evento actualizada.';
        this.load();
      },
      error: (error: unknown) => {
        this.error = this.message(error);
        this.coverLoadingId = '';
        this.cdr.markForCheck();
      },
    });
  }

  fotoBadgeClass(active: boolean): string {
    return active ? 'bg-success' : 'bg-warning text-dark';
  }

  deleteFoto(foto: Foto): void {
    if (!this.session.isAdmin) {
      this.error = 'No tenes permisos para realizar esta accion.';
      return;
    }

    if (!confirm(`Eliminar foto "${foto.nombreArchivo}"?`)) {
      return;
    }

    this.fotosService.delete(foto.id).subscribe({
      next: () => this.load(),
      error: (error: unknown) => {
        this.error = this.message(error);
      },
    });
  }

  trackById(_: number, foto: Foto): string {
    return foto.id;
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'No se pudieron cargar las fotos.';
  }

  private normalize(value: unknown): string {
    return String(value ?? '')
      .trim()
      .toLowerCase();
  }
}
