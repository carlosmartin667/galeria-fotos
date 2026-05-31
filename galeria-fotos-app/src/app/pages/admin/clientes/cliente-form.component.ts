import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ClientesService } from '../../../api/clientes.service';
import { CrearClienteRequestDto } from '../../../api/models';

@Component({
  selector: 'app-cliente-form',
  standalone: false,
  templateUrl: './cliente-form.component.html'
})
export class ClienteFormComponent implements OnInit {
  private readonly clientesService = inject(ClientesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  id: string | null = null;
  loading = false;
  saving = false;
  error = '';

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(160)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', Validators.maxLength(64)],
    documento: ['', Validators.maxLength(64)]
  });

  get isEdit(): boolean {
    return this.id !== null;
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');

    if (this.id) {
      this.loading = true;
      this.clientesService.get(this.id).subscribe({
        next: (cliente) => {
          this.form.patchValue({
            nombre: cliente.nombre,
            email: cliente.email,
            telefono: cliente.telefono ?? '',
            documento: cliente.documento ?? ''
          });
          this.loading = false;
        },
        error: (error: unknown) => {
          this.error = this.message(error);
          this.loading = false;
        }
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: CrearClienteRequestDto = {
      nombre: raw.nombre.trim(),
      email: raw.email.trim(),
      telefono: raw.telefono.trim() || null,
      documento: raw.documento.trim() || null
    };
    const request = this.id
      ? this.clientesService.update(this.id, payload)
      : this.clientesService.create(payload);

    this.saving = true;
    this.error = '';

    request.subscribe({
      next: () => void this.router.navigate(['/admin/clientes']),
      error: (error: unknown) => {
        this.error = this.message(error);
        this.saving = false;
      }
    });
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'No se pudo guardar el cliente.';
  }
}
