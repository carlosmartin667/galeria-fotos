import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, finalize, forkJoin, of } from 'rxjs';

import { ClientesService } from '../../core/services/clientes.service';
import { EventosService } from '../../core/services/eventos.service';
import { PedidosService } from '../../core/services/pedidos.service';
import { SessionService } from '../../core/services/session.service';
import { ErrorAlertComponent } from '../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

interface SummaryCard {
  label: string;
  value: number | string;
  link: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, ErrorAlertComponent, LoadingComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private readonly clientesService = inject(ClientesService);
  private readonly eventosService = inject(EventosService);
  private readonly pedidosService = inject(PedidosService);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly session = inject(SessionService);

  loading = false;
  error = '';
  cards: SummaryCard[] = [
    { label: 'Clientes', value: '-', link: '/clientes', icon: 'fas fa-users' },
    { label: 'Eventos', value: '-', link: '/eventos', icon: 'fas fa-calendar-alt' },
    { label: 'Fotos', value: 'Por evento', link: '/fotos/evento', icon: 'fas fa-images' },
    { label: 'Pedidos', value: '-', link: '/pedidos', icon: 'fas fa-shopping-cart' }
  ];

  ngOnInit(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      clientes: this.clientesService.list().pipe(catchError((error: unknown) => this.fallback(error))),
      eventos: this.eventosService.list().pipe(catchError((error: unknown) => this.fallback(error))),
      pedidos: this.pedidosService.list().pipe(catchError((error: unknown) => this.fallback(error)))
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: ({ clientes, eventos, pedidos }) => {
        this.setCard('Clientes', clientes.length);
        this.setCard('Eventos', eventos.length);
        this.setCard('Pedidos', pedidos.length);
      }
    });
  }

  private setCard(label: string, value: number): void {
    this.cards = this.cards.map((card) => card.label === label ? { ...card, value } : card);
  }

  private captureError(error: unknown): void {
    if (!this.error) {
      this.error = error instanceof Error ? error.message : 'No se pudo cargar el resumen.';
    }
  }

  private fallback<T>(error: unknown) {
    this.captureError(error);
    return of<T[]>([]);
  }
}
