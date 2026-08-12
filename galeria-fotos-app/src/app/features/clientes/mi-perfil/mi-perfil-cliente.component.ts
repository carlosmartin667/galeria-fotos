import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { Cliente } from '../../../core/models/cliente.models';
import { ClientesService } from '../../../core/services/clientes.service';
import { SessionService } from '../../../core/services/session.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-mi-perfil-cliente',
  standalone: true,
  imports: [ReactiveFormsModule, EmptyStateComponent, ErrorAlertComponent, LoadingComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './mi-perfil-cliente.component.html',
})
export class MiPerfilClienteComponent implements OnInit {
  private readonly clientesService = inject(ClientesService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  cliente: Cliente | null = null;
  loading = false;
  saving = false;
  submitted = false;
  error = '';
  success = '';

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(160)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', Validators.maxLength(64)],
    documento: ['', Validators.maxLength(64)],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const id = this.session.userId;

    if (!id) {
      this.error = 'No se encontro el identificador del cliente en la sesion.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.clientesService
      .get(id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (cliente) => {
          this.cliente = cliente;
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
    this.success = '';

    if (!this.cliente || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.saving = true;

    this.clientesService
      .update(this.cliente.id, {
        nombre: raw.nombre.trim(),
        email: raw.email.trim(),
        telefono: raw.telefono.trim() || undefined,
        documento: raw.documento.trim() || undefined,
      })
      .subscribe({
        next: (cliente) => {
          this.cliente = cliente;
          this.success = 'Perfil actualizado correctamente.';
          this.saving = false;
          this.cdr.markForCheck();
        },
        error: (error: unknown) => {
          this.error = this.message(error);
          this.saving = false;
          this.cdr.markForCheck();
        },
      });
  }

  deleteProfile(): void {
    if (!this.cliente || !confirm('Eliminar tu perfil de cliente?')) {
      return;
    }

    this.clientesService.delete(this.cliente.id).subscribe({
      next: () => {
        this.session.clear();
        void this.router.navigate(['/login'], { queryParams: { message: 'Perfil eliminado.' } });
      },
      error: (error: unknown) => {
        this.error = this.message(error);
        this.cdr.markForCheck();
      },
    });
  }

  showError(controlName: 'nombre' | 'email'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted);
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'No se pudo cargar el perfil.';
  }
}
