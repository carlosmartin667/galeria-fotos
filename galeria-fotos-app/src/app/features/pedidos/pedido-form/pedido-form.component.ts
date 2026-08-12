import { ChangeDetectorRef, Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CrearPedidoRequest } from '../../../core/models/pedido.models';
import { PedidosService } from '../../../core/services/pedidos.service';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';

@Component({
  selector: 'app-pedido-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ErrorAlertComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './pedido-form.component.html',
})
export class PedidoFormComponent {
  private readonly pedidosService = inject(PedidosService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  saving = false;
  submitted = false;
  error = '';

  readonly form = this.fb.nonNullable.group({
    eventoId: ['', Validators.required],
    clienteId: ['', Validators.required],
    fotoIds: [''],
  });

  get isAdminRoute(): boolean {
    const url = this.router.url.split('?')[0];
    return url === '/admin' || url.startsWith('/admin/');
  }

  pedidosPath(): string {
    return this.isAdminRoute ? '/admin/pedidos' : '/pedidos';
  }

  submit(): void {
    this.submitted = true;
    this.error = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const fotoIds = raw.fotoIds
      .split(/[\n,;]+/)
      .map((id) => id.trim())
      .filter(Boolean);
    const payload: CrearPedidoRequest = {
      eventoId: raw.eventoId.trim(),
      clienteId: raw.clienteId.trim(),
      fotoIds: fotoIds.length > 0 ? fotoIds : undefined,
    };

    this.saving = true;
    this.pedidosService.create(payload).subscribe({
      next: () => void this.router.navigate([this.pedidosPath()]),
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo crear el pedido.';
        this.saving = false;
        this.cdr.markForCheck();
      },
    });
  }

  showError(controlName: 'eventoId' | 'clienteId'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted);
  }
}
