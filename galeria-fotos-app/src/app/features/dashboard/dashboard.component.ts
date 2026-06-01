import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly session = inject(SessionService);

  loading = false;
  error = '';
  message = '';
  cards: SummaryCard[] = [];

  ngOnInit(): void {
    this.message = this.route.snapshot.queryParamMap.get('message') ?? '';
    this.load();
  }

  get quickLinks(): SummaryCard[] {
    if (this.session.isAdmin) {
      return [
        { label: 'Clientes', value: '', link: '/clientes', icon: 'fas fa-users' },
        { label: 'Eventos', value: '', link: '/eventos', icon: 'fas fa-calendar-alt' },
        { label: 'Fotos', value: '', link: '/fotos/evento', icon: 'fas fa-images' },
        { label: 'Perfil admin', value: '', link: '/admin/mi-perfil', icon: 'fas fa-id-card' }
      ];
    }

    if (this.session.isAuthenticated) {
      return [
        { label: 'Eventos', value: '', link: '/eventos', icon: 'fas fa-calendar-alt' },
        { label: 'Fotos', value: '', link: '/fotos/evento', icon: 'fas fa-images' },
        { label: 'Mis pedidos', value: '', link: '/pedidos', icon: 'fas fa-shopping-cart' },
        { label: 'Mis favoritos', value: '', link: '/favoritos', icon: 'fas fa-heart' }
      ];
    }

    return [
      { label: 'Eventos', value: '', link: '/eventos', icon: 'fas fa-calendar-alt' },
      { label: 'Fotos', value: '', link: '/fotos/evento', icon: 'fas fa-images' },
      { label: 'Perfil publico', value: '', link: '/admin/perfil-publico', icon: 'fas fa-address-card' },
      { label: 'Iniciar sesion', value: '', link: '/login', icon: 'fas fa-sign-in-alt' }
    ];
  }

  load(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      clientes: this.session.isAdmin ? this.clientesService.list().pipe(catchError((error: unknown) => this.fallback(error))) : of([]),
      eventos: this.eventosService.list().pipe(catchError((error: unknown) => this.fallback(error))),
      pedidos: this.session.isAuthenticated ? this.pedidosService.list().pipe(catchError((error: unknown) => this.fallback(error))) : of([])
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: ({ clientes, eventos, pedidos }) => {
        this.cards = this.buildCards(clientes.length, eventos.length, pedidos.length);
      }
    });
  }

  private buildCards(clientes: number, eventos: number, pedidos: number): SummaryCard[] {
    const cards: SummaryCard[] = [
      { label: 'Eventos', value: eventos, link: '/eventos', icon: 'fas fa-calendar-alt' },
      { label: 'Fotos', value: 'Por evento', link: '/fotos/evento', icon: 'fas fa-images' },
      { label: 'Perfil publico', value: 'Visible', link: '/admin/perfil-publico', icon: 'fas fa-address-card' }
    ];

    if (this.session.isAuthenticated) {
      cards.push({ label: this.session.isAdmin ? 'Pedidos' : 'Mis pedidos', value: pedidos, link: '/pedidos', icon: 'fas fa-shopping-cart' });
      cards.push({ label: this.session.isAdmin ? 'Favoritos' : 'Mis favoritos', value: 'Ver', link: '/favoritos', icon: 'fas fa-heart' });
    }

    if (this.session.isAdmin) {
      cards.unshift({ label: 'Clientes', value: clientes, link: '/clientes', icon: 'fas fa-users' });
    }

    return cards;
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
