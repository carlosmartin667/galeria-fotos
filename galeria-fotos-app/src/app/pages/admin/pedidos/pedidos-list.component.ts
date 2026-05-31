import { Component, OnInit, inject } from '@angular/core';

import { Pedido } from '../../../api/models';
import { PedidosService } from '../../../api/pedidos.service';

@Component({
  selector: 'app-pedidos-list',
  standalone: false,
  templateUrl: './pedidos-list.component.html'
})
export class PedidosListComponent implements OnInit {
  private readonly pedidosService = inject(PedidosService);

  pedidos: Pedido[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.pedidosService.list().subscribe({
      next: (pedidos) => {
        this.pedidos = pedidos;
        this.loading = false;
      },
      error: (error: unknown) => {
        this.error = this.message(error);
        this.loading = false;
      }
    });
  }

  trackById(_: number, pedido: Pedido): string {
    return pedido.id;
  }

  fotoCount(pedido: Pedido): number {
    return pedido.fotoIds?.length ?? 0;
  }

  total(pedido: Pedido): number {
    return pedido.total ?? pedido.totalAmount ?? 0;
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'No se pudieron cargar los pedidos.';
  }
}
