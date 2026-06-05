import { ChangeDetectorRef, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Cliente } from '../../../core/models/cliente.models';
import { ClientesService } from '../../../core/services/clientes.service';
import { SessionService } from '../../../core/services/session.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [FormsModule, RouterLink, EmptyStateComponent, ErrorAlertComponent, LoadingComponent],
  templateUrl: './clientes-list.component.html',
})
export class ClientesListComponent implements OnInit {
  private readonly clientesService = inject(ClientesService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  readonly session = inject(SessionService);

  readonly clientes = signal<Cliente[]>([]);
  readonly search = signal('');
  readonly filteredClientes = computed(() => {
    const term = this.search().trim().toLowerCase();

    if (!term) {
      return this.clientes();
    }

    return this.clientes().filter((cliente) =>
      [cliente.nombre, cliente.email, cliente.telefono, cliente.documento].some((value) =>
        value?.toLowerCase().includes(term),
      ),
    );
  });

  loading = false;
  error = '';

  ngOnInit(): void {
    this.load();
  }

  get isAdminRoute(): boolean {
    const url = this.router.url.split('?')[0];
    return url === '/admin' || url.startsWith('/admin/');
  }

  clientesPath(): string {
    return this.isAdminRoute ? '/admin/clientes' : '/clientes';
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.clientesService
      .list()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (clientes) => {
          this.clientes.set(clientes);
        },
        error: (error: unknown) => {
          this.error = this.message(error);
        },
      });
  }

  deleteCliente(cliente: Cliente): void {
    if (!this.session.isAdmin) {
      this.error = 'No tenes permisos para realizar esta accion.';
      return;
    }

    if (!confirm(`Eliminar cliente "${cliente.nombre}"?`)) {
      return;
    }

    this.clientesService.delete(cliente.id).subscribe({
      next: () => this.load(),
      error: (error: unknown) => {
        this.error = this.message(error);
        this.cdr.markForCheck();
      },
    });
  }

  trackById(_: number, cliente: Cliente): string {
    return cliente.id;
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'No se pudieron cargar los clientes.';
  }
}
