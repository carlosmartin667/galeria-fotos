import { DatePipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Evento } from '../../../core/models/evento.models';
import { EventosService } from '../../../core/services/eventos.service';
import { SessionService } from '../../../core/services/session.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-eventos-list',
  standalone: true,
  imports: [DatePipe, NgFor, NgIf, RouterLink, EmptyStateComponent, ErrorAlertComponent, LoadingComponent],
  templateUrl: './eventos-list.component.html'
})
export class EventosListComponent implements OnInit {
  private readonly eventosService = inject(EventosService);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly session = inject(SessionService);

  eventos: Evento[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.eventosService.list().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (eventos) => {
        this.eventos = eventos;
      },
      error: (error: unknown) => {
        this.error = this.message(error);
        this.cdr.markForCheck();
      }
    });
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
      }
    });
  }

  trackById(_: number, evento: Evento): string {
    return evento.id;
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'No se pudieron cargar los eventos.';
  }
}
