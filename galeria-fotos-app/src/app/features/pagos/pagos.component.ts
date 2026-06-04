import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { PreferenciaPagoResponse } from '../../core/models/pago.models';
import { PagosService } from '../../core/services/pagos.service';
import { ErrorAlertComponent } from '../../shared/components/error-alert/error-alert.component';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, ErrorAlertComponent],
  templateUrl: './pagos.component.html'
})
export class PagosComponent {
  private readonly pagosService = inject(PagosService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = false;
  submitted = false;
  error = '';
  preference: PreferenciaPagoResponse | null = null;

  readonly form = this.fb.nonNullable.group({
    pedidoId: ['', Validators.required]
  });

  get checkoutUrl(): string {
    return this.preference?.initPoint || this.preference?.sandboxInitPoint || '';
  }

  submit(): void {
    this.submitted = true;
    this.error = '';
    this.preference = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.pagosService.createPreference({ pedidoId: this.form.controls.pedidoId.getRawValue().trim() }).subscribe({
      next: (preference) => {
        this.preference = preference;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo crear la preferencia.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
