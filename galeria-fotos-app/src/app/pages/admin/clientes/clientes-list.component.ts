import { Component, OnInit, inject } from '@angular/core';

import { ClientesService } from '../../../api/clientes.service';
import { Cliente } from '../../../api/models';

@Component({
  selector: 'app-clientes-list',
  standalone: false,
  templateUrl: './clientes-list.component.html'
})
export class ClientesListComponent implements OnInit {
  private readonly clientesService = inject(ClientesService);

  clientes: Cliente[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.clientesService.list().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
        this.loading = false;
      },
      error: (error: unknown) => {
        this.error = this.message(error);
        this.loading = false;
      }
    });
  }

  deleteCliente(cliente: Cliente): void {
    if (!confirm(`Eliminar cliente "${cliente.nombre}"?`)) {
      return;
    }

    this.clientesService.delete(cliente.id).subscribe({
      next: () => this.load(),
      error: (error: unknown) => {
        this.error = this.message(error);
      }
    });
  }

  trackById(_: number, cliente: Cliente): string {
    return cliente.id;
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'No se pudieron cargar los clientes.';
  }
}
