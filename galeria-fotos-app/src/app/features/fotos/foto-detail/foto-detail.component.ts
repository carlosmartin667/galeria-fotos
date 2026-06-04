import { CurrencyPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

import { ComentarioResponse } from '../../../core/models/comentario.models';
import { Evento } from '../../../core/models/evento.models';
import { Foto } from '../../../core/models/foto.models';
import { ComentariosService } from '../../../core/services/comentarios.service';
import { EventosService } from '../../../core/services/eventos.service';
import { FavoritosService } from '../../../core/services/favoritos.service';
import { FotosService } from '../../../core/services/fotos.service';
import { SessionService } from '../../../core/services/session.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { ImageLightboxComponent } from '../../../shared/components/image-lightbox/image-lightbox.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-foto-detail',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, NgClass, NgFor, NgIf, RouterLink, EmptyStateComponent, ErrorAlertComponent, ImageLightboxComponent, LoadingComponent],
  templateUrl: './foto-detail.component.html'
})
export class FotoDetailComponent implements OnInit {
  private readonly fotosService = inject(FotosService);
  private readonly comentariosService = inject(ComentariosService);
  private readonly eventosService = inject(EventosService);
  private readonly favoritosService = inject(FavoritosService);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly session = inject(SessionService);

  foto: Foto | null = null;
  evento: Evento | null = null;
  comentarios: ComentarioResponse[] = [];
  comentarioTexto = '';
  editingCommentId = '';
  editingText = '';
  isFavorite = false;
  loading = false;
  savingComment = false;
  favoriteLoading = false;
  lightboxOpen = false;
  coverLoading = false;
  error = '';
  success = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'Foto no encontrada.';
      return;
    }

    this.loading = true;
    this.error = '';

    forkJoin({
      foto: this.fotosService.get(id),
      comentarios: this.comentariosService.listFoto(id)
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: ({ foto, comentarios }) => {
        this.foto = foto;
        this.comentarios = comentarios;
        this.loadFavoriteState(foto.id);
        this.loadEvento(foto.eventoId);
      },
      error: (error: unknown) => {
        this.error = this.message(error);
      }
    });
  }

  addComment(): void {
    if (!this.foto || !this.session.isAuthenticated) {
      this.error = 'Esta seccion requiere iniciar sesion.';
      return;
    }

    const texto = this.comentarioTexto.trim();

    if (!texto) {
      this.error = 'Escribi un comentario.';
      return;
    }

    this.savingComment = true;
    this.comentariosService.createFoto(this.foto.id, { texto }).subscribe({
      next: () => {
        this.comentarioTexto = '';
        this.savingComment = false;
        this.load();
      },
      error: (error: unknown) => {
        this.error = this.message(error);
        this.savingComment = false;
        this.cdr.markForCheck();
      }
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

    this.comentariosService.updateFoto(comment.id, { texto }).subscribe({
      next: () => {
        this.cancelEdit();
        this.load();
      },
      error: (error: unknown) => {
        this.error = this.message(error);
        this.cdr.markForCheck();
      }
    });
  }

  deleteComment(comment: ComentarioResponse): void {
    if (!confirm('Eliminar comentario?')) {
      return;
    }

    this.comentariosService.deleteFoto(comment.id).subscribe({
      next: () => this.load(),
      error: (error: unknown) => {
        this.error = this.message(error);
        this.cdr.markForCheck();
      }
    });
  }

  toggleFavorite(): void {
    if (!this.foto || !this.session.isAuthenticated) {
      this.error = 'Esta seccion requiere iniciar sesion.';
      return;
    }

    this.favoriteLoading = true;
    const request = this.isFavorite
      ? this.favoritosService.removeFoto(this.foto.id)
      : this.favoritosService.addFoto(this.foto.id);

    request.subscribe({
      next: () => {
        this.isFavorite = !this.isFavorite;
        this.favoriteLoading = false;
        this.success = this.isFavorite ? 'Foto guardada en favoritos.' : 'Foto quitada de favoritos.';
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.error = this.message(error);
        this.favoriteLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  openLightbox(): void {
    if (this.foto?.previewUrl) {
      this.lightboxOpen = true;
    }
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
  }

  isPortada(): boolean {
    return Boolean(this.foto?.id && this.evento?.portadaFotoId === this.foto.id);
  }

  asignarPortada(): void {
    if (!this.session.isAdmin || !this.foto) {
      this.error = 'No tenes permisos para realizar esta accion.';
      return;
    }

    this.coverLoading = true;
    this.error = '';
    this.eventosService.asignarPortada(this.foto.eventoId, this.foto.id).subscribe({
      next: () => {
        this.coverLoading = false;
        this.success = 'Portada del evento actualizada.';
        this.loadEvento(this.foto?.eventoId ?? '');
      },
      error: (error: unknown) => {
        this.error = this.message(error);
        this.coverLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  fotoBadgeClass(active: boolean): string {
    return active ? 'bg-success' : 'bg-warning text-dark';
  }

  canManageComment(comment: ComentarioResponse): boolean {
    return this.session.isAdmin || Boolean(this.session.userId && comment.usuarioId === this.session.userId);
  }

  trackByComment(_: number, comment: ComentarioResponse): string {
    return comment.id;
  }

  private loadFavoriteState(fotoId: string): void {
    if (!this.session.isAuthenticated) {
      this.isFavorite = false;
      return;
    }

    this.favoritosService.listFotos().subscribe({
      next: (favoritos) => {
        this.isFavorite = favoritos.some((favorito) => favorito.fotoId === fotoId);
        this.cdr.markForCheck();
      },
      error: () => {
        this.isFavorite = false;
      }
    });
  }

  private loadEvento(eventoId: string): void {
    if (!eventoId) {
      this.evento = null;
      return;
    }

    this.eventosService.get(eventoId).subscribe({
      next: (evento) => {
        this.evento = evento;
        this.cdr.markForCheck();
      },
      error: () => {
        this.evento = null;
      }
    });
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'No se pudo cargar la foto.';
  }
}
