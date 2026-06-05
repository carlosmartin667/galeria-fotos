import { ChangeDetectorRef, Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ErrorAlertComponent],
  templateUrl: './register.component.html',
  styleUrl: '../login/login.component.css',
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = false;
  submitted = false;
  error = '';

  readonly form = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.maxLength(160)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    },
    { validators: this.passwordsMatch },
  );

  submit(): void {
    this.submitted = true;
    this.error = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.loading = true;

    this.authService
      .register({
        nombre: raw.nombre.trim(),
        email: raw.email.trim(),
        password: raw.password,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.cdr.markForCheck();
          void this.router.navigate(['/login'], {
            queryParams: { message: 'Cuenta creada. Ya podes iniciar sesion.' },
          });
        },
        error: (error: unknown) => {
          this.loading = false;
          this.error = error instanceof Error ? error.message : 'No se pudo crear la cuenta.';
          this.cdr.markForCheck();
        },
      });
  }

  showError(controlName: 'nombre' | 'email' | 'password' | 'confirmPassword'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted);
  }

  private passwordsMatch(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }
}
