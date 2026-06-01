import { DatePipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit, inject } from '@angular/core';
import { finalize } from 'rxjs';

import { DisponibilidadAgendaItem } from '../../../core/models/agenda.models';
import { AgendaService } from '../../../core/services/agenda.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-agenda-disponibilidad-publica',
  standalone: true,
  imports: [DatePipe, NgFor, NgIf, EmptyStateComponent, ErrorAlertComponent, LoadingComponent],
  templateUrl: './agenda-disponibilidad-publica.component.html',
  styleUrl: './agenda-disponibilidad-publica.component.css'
})
export class AgendaDisponibilidadPublicaComponent implements OnInit {
  private readonly agendaService = inject(AgendaService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() title = 'Fechas ocupadas proximas';
  @Input() compact = false;

  items: DisponibilidadAgendaItem[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    const desde = this.toDateOnly(new Date());
    const hastaDate = new Date();
    hastaDate.setDate(hastaDate.getDate() + 90);
    const hasta = this.toDateOnly(hastaDate);

    this.agendaService.getDisponibilidad(desde, hasta).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (items) => {
        this.items = items
          .filter((item) => item.ocupado)
          .sort((a, b) => new Date(a.fechaInicioUtc).getTime() - new Date(b.fechaInicioUtc).getTime())
          .slice(0, this.compact ? 4 : 8);
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo cargar la disponibilidad.';
      }
    });
  }

  trackByDate(index: number, item: DisponibilidadAgendaItem): string {
    return `${item.fechaInicioUtc}-${item.fechaFinUtc}-${index}`;
  }

  private toDateOnly(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
