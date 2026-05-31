import { Component, OnInit, inject } from '@angular/core';

import { EventosService } from '../../../api/eventos.service';
import { Evento } from '../../../api/models';

@Component({
  selector: 'app-eventos-list',
  standalone: false,
  templateUrl: './eventos-list.component.html'
})
export class EventosListComponent implements OnInit {
  private readonly eventosService = inject(EventosService);

  eventos: Evento[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.eventosService.list().subscribe({
      next: (eventos) => {
        this.eventos = eventos;
        this.loading = false;
      },
      error: (error: unknown) => {
        this.error = this.message(error);
        this.loading = false;
      }
    });
  }

  deleteEvento(evento: Evento): void {
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
