import { DatePipe, NgClass } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

import { ComentarioResponse } from '../../../core/models/comentario.models';
import { Evento } from '../../../core/models/evento.models';
import { ComentariosService } from '../../../core/services/comentarios.service';
import { EventosService } from '../../../core/services/eventos.service';
import { FavoritosService } from '../../../core/services/favoritos.service';
import { SessionService } from '../../../core/services/session.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-evento-detail',
  standalone: true,
  imports: [
    DatePipe,
    NgClass,
    FormsModule,
    RouterLink,
    EmptyStateComponent,
    ErrorAlertComponent,
    LoadingComponent,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './evento-detail.component.html',
})
export class EventoDetailComponent implements OnInit {
  private readonly eventosService = inject(EventosService);
  private readonly comentariosService = inject(ComentariosService);
  private readonly favoritosService = inject(FavoritosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly session = inject(SessionService);

  evento: Evento | null = null;
  comentarios: ComentarioResponse[] = [];
  comentarioTexto = '';
  editingCommentId = '';
  editingText = '';
  isFavorite = false;
  loading = false;
  savingComment = false;
  favoriteLoading = false;
  error = '';
  success = '';

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
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'Evento no encontrado.';
      return;
    }

    this.loading = true;
    this.error = '';

    forkJoin({
      evento: this.eventosService.get(id),
      comentarios: this.comentariosService.listEvento(id),
    })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: ({ evento, comentarios }) => {
          this.evento = evento;
          this.comentarios = comentarios;
          this.loadFavoriteState(evento.id);
        },
        error: (error: unknown) => {
          this.error = this.message(error);
        },
      });
  }

  addComment(): void {
    if (!this.evento || !this.session.isAuthenticated) {
      this.error = 'Esta seccion requiere iniciar sesion.';
      return;
    }

    const texto = this.comentarioTexto.trim();

    if (!texto) {
      this.error = 'Escribi un comentario.';
      return;
    }

    this.savingComment = true;
    this.error = '';

    this.comentariosService.createEvento(this.evento.id, { texto }).subscribe({
      next: () => {
        this.comentarioTexto = '';
        this.savingComment = false;
        this.load();
      },
      error: (error: unknown) => {
        this.error = this.message(error);
        this.savingComment = false;
        this.cdr.markForCheck();
      },
    });
  }

  startEdit(comment: ComentarioResponse): void {
    this.editingCommentId = comment.id;
    this.editingText = comment.texto;
  }

  cancelEdit(): void {
    this.editingCommentId = '';
    this.editingText = '';
  }

  saveEdit(comment: ComentarioResponse): void {
    const texto = this.editingText.trim();

    if (!texto) {
      this.error = 'El comentario no puede quedar vacio.';
      return;
    }

    this.comentariosService.updateEvento(comment.id, { texto }).subscribe({
      next: () => {
        this.cancelEdit();
        this.load();
      },
      error: (error: unknown) => {
        this.error = this.message(error);
        this.cdr.markForCheck();
      },
    });
  }

  deleteComment(comment: ComentarioResponse): void {
    if (!confirm('Eliminar comentario?')) {
      return;
    }

    this.comentariosService.deleteEvento(comment.id).subscribe({
      next: () => this.load(),
      error: (error: unknown) => {
        this.error = this.message(error);
        this.cdr.markForCheck();
      },
    });
  }

  toggleFavorite(): void {
    if (!this.evento || !this.session.isAuthenticated) {
      this.error = 'Esta seccion requiere iniciar sesion.';
      return;
    }

    this.favoriteLoading = true;
    const request = this.isFavorite
      ? this.favoritosService.removeEvento(this.evento.id)
      : this.favoritosService.addEvento(this.evento.id);

    request.subscribe({
      next: () => {
        this.isFavorite = !this.isFavorite;
        this.favoriteLoading = false;
        this.success = this.isFavorite
          ? 'Evento guardado en favoritos.'
          : 'Evento quitado de favoritos.';
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.error = this.message(error);
        this.favoriteLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  canManageComment(comment: ComentarioResponse): boolean {
    return (
      this.session.isAdmin ||
      Boolean(this.session.userId && comment.usuarioId === this.session.userId)
    );
  }

  badgeClass(
    value: string | undefined,
    kind: 'estado' | 'visibilidad' | 'activo' = 'estado',
  ): string {
    const normalized = String(value ?? '')
      .trim()
      .toLowerCase();

    if (kind === 'activo') {
      return normalized === 'true' ? 'bg-success' : 'bg-secondary';
    }

    if (['publicado', 'publico'].includes(normalized)) {
      return 'bg-success';
    }

    if (['borrador', 'privado'].includes(normalized)) {
      return 'bg-warning text-dark';
    }

    if (normalized === 'finalizado') {
      return 'bg-primary';
    }

    if (['archivado', 'oculto'].includes(normalized)) {
      return 'bg-secondary';
    }

    return 'bg-light text-dark border';
  }

  trackByComment(_: number, comment: ComentarioResponse): string {
    return comment.id;
  }

  private loadFavoriteState(eventoId: string): void {
    if (!this.session.isAuthenticated) {
      this.isFavorite = false;
      return;
    }

    this.favoritosService.listEventos().subscribe({
      next: (favoritos) => {
        this.isFavorite = favoritos.some((favorito) => favorito.eventoId === eventoId);
        this.cdr.markForCheck();
      },
      error: () => {
        this.isFavorite = false;
      },
    });
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'No se pudo cargar el evento.';
  }
}
