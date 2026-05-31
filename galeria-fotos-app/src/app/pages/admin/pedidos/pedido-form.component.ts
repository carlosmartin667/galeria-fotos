import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CrearPedidoRequestDto } from '../../../api/models';
import { PedidosService } from '../../../api/pedidos.service';

@Component({
  selector: 'app-pedido-form',
  standalone: false,
  templateUrl: './pedido-form.component.html'
})
export class PedidoFormComponent {
  private readonly pedidosService = inject(PedidosService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  saving = false;
  error = '';

  readonly form = this.fb.nonNullable.group({
    eventoId: ['', Validators.required],
    clienteId: ['', Validators.required],
    fotoIds: ['']
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const fotoIds = raw.fotoIds
      .split(/[\n,;]+/)
      .map((id) => id.trim())
      .filter(Boolean);
    const payload: CrearPedidoRequestDto = {
      eventoId: raw.eventoId.trim(),
      clienteId: raw.clienteId.trim(),
      fotoIds: fotoIds.length > 0 ? fotoIds : null
    };

    this.saving = true;
    this.error = '';

    this.pedidosService.create(payload).subscribe({
      next: () => void this.router.navigate(['/admin/pedidos']),
      error: (error: unknown) => {
        this.error = this.message(error);
        this.saving = false;
      }
    });
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'No se pudo guardar el pedido.';
  }
}
