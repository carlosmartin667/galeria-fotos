import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { CrearClienteRequest } from '../../../core/models/cliente.models';
import { ClientesService } from '../../../core/services/clientes.service';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ErrorAlertComponent, LoadingComponent],
  templateUrl: './cliente-form.component.html',
})
export class ClienteFormComponent implements OnInit {
  private readonly clientesService = inject(ClientesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  id: string | null = null;
  loading = false;
  saving = false;
  submitted = false;
  error = '';

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(160)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', Validators.maxLength(64)],
    documento: ['', Validators.maxLength(64)],
  });

  get isEdit(): boolean {
    return Boolean(this.id);
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');

    if (!this.id) {
      return;
    }

    this.loading = true;
    this.clientesService
      .get(this.id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (cliente) => {
          this.form.patchValue({
            nombre: cliente.nombre,
            email: cliente.email,
            telefono: cliente.telefono ?? '',
            documento: cliente.documento ?? '',
          });
        },
        error: (error: unknown) => {
          this.error = this.message(error);
        },
      });
  }

  submit(): void {
    this.submitted = true;
    this.error = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: CrearClienteRequest = {
      nombre: raw.nombre.trim(),
      email: raw.email.trim(),
      telefono: raw.telefono.trim() || undefined,
      documento: raw.documento.trim() || undefined,
    };
    const request = this.id
      ? this.clientesService.update(this.id, payload)
      : this.clientesService.create(payload);

    this.saving = true;
    request.subscribe({
      next: () => void this.router.navigate(['/clientes']),
      error: (error: unknown) => {
        this.error = this.message(error);
        this.saving = false;
        this.cdr.markForCheck();
      },
    });
  }

  showError(controlName: 'nombre' | 'email'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted);
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'No se pudo guardar el cliente.';
  }
}
