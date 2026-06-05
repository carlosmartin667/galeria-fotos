import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { PaginationQuery } from '../../../core/models/pagination.models';
import { Pedido } from '../../../core/models/pedido.models';
import { PedidosService } from '../../../core/services/pedidos.service';
import { SessionService } from '../../../core/services/session.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PaginationControlsComponent } from '../../../shared/components/pagination-controls/pagination-controls.component';

@Component({
  selector: 'app-pedidos-list',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    FormsModule,
    RouterLink,
    EmptyStateComponent,
    ErrorAlertComponent,
    LoadingComponent,
    PaginationControlsComponent,
  ],
  templateUrl: './pedidos-list.component.html',
})
export class PedidosListComponent implements OnInit {
  private readonly pedidosService = inject(PedidosService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  readonly session = inject(SessionService);

  pedidos: Pedido[] = [];
  searchTerm = '';
  estadoFilter = 'Todos';
  readonly estadoOptions = ['Todos', 'Pendiente', 'Pagado', 'Aprobado', 'Cancelado'];
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

  pedidosPath(): string {
    return this.isAdminRoute ? '/admin/pedidos' : '/pedidos';
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.pedidosService
      .getPedidosPaginados(this.pagination)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response) => {
          this.pedidos = response.items;
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
        },
      });
  }

  get filteredPedidos(): Pedido[] {
    const term = this.normalize(this.searchTerm);
    const estado = this.normalize(this.estadoFilter);

    return this.pedidos.filter((pedido) => {
      const matchesSearch =
        !term ||
        [pedido.id, pedido.eventoId, pedido.clienteId, pedido.estado, pedido.moneda].some((value) =>
          this.normalize(value).includes(term),
        );
      const matchesEstado =
        this.estadoFilter === 'Todos' || this.normalize(pedido.estado) === estado;
      return matchesSearch && matchesEstado;
    });
  }

  onPaginationChange(query: PaginationQuery): void {
    this.pagination = query;
    this.load();
  }

  trackById(_: number, pedido: Pedido): string {
    return pedido.id;
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'No se pudieron cargar los pedidos.';
  }

  private normalize(value: unknown): string {
    return String(value ?? '')
      .trim()
      .toLowerCase();
  }
}
