import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { AuthService } from '../../../api/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: false,
  templateUrl: './admin-login.component.html'
})
export class AdminLoginComponent {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  loading = false;
  error = '';
  success = '';

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Token guardado. Las proximas llamadas a la API usaran Authorization Bearer.';
      },
      error: (error: unknown) => {
        this.loading = false;
        this.error = this.message(error);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.success = 'Token eliminado.';
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'No se pudo iniciar sesion.';
  }
}
