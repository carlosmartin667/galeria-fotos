import { CurrencyPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Pedido } from '../../../core/models/pedido.models';
import { PedidosService } from '../../../core/services/pedidos.service';
import { SessionService } from '../../../core/services/session.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-pedidos-list',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgFor, NgIf, RouterLink, EmptyStateComponent, ErrorAlertComponent, LoadingComponent],
  templateUrl: './pedidos-list.component.html'
})
export class PedidosListComponent implements OnInit {
  private readonly pedidosService = inject(PedidosService);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly session = inject(SessionService);

  pedidos: Pedido[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.pedidosService.list().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (pedidos) => {
        this.pedidos = pedidos;
      },
      error: (error: unknown) => {
        this.error = this.message(error);
      }
    });
  }

  trackById(_: number, pedido: Pedido): string {
    return pedido.id;
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'No se pudieron cargar los pedidos.';
  }
}
