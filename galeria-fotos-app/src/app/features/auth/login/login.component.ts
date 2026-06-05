import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { SessionService } from '../../../core/services/session.service';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ErrorAlertComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly session = inject(SessionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = false;
  submitted = false;
  error = '';
  message = '';

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  ngOnInit(): void {
    this.message = this.route.snapshot.queryParamMap.get('message') ?? '';
  }

  submit(): void {
    this.submitted = true;
    this.error = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.cdr.markForCheck();
        void this.router.navigateByUrl(this.nextUrl());
      },
      error: (error: unknown) => {
        this.loading = false;
        this.error = this.toMessage(error);
        this.cdr.markForCheck();
      },
    });
  }

  enterGuest(): void {
    this.authService.enterGuestMode();
    void this.router.navigate(['/dashboard']);
  }

  showError(controlName: 'email' | 'password'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted);
  }

  private toMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'No se pudo iniciar sesion.';
  }

  private nextUrl(): string {
    const returnUrl = this.safeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl'));

    if (this.session.isAdmin) {
      return this.adminUrl(returnUrl) ?? '/admin/dashboard';
    }

    if (returnUrl) {
      return returnUrl;
    }

    return '/dashboard';
  }

  private safeReturnUrl(value: string | null): string | null {
    if (!value || !value.startsWith('/') || value.startsWith('//')) {
      return null;
    }

    if (value === '/login' || value.startsWith('/login?') || value === '/register' || value.startsWith('/register?')) {
      return null;
    }

    return value;
  }

  private adminUrl(returnUrl: string | null): string | null {
    if (!returnUrl) {
      return null;
    }

    const adminMappings: Array<[RegExp, string]> = [
      [/^\/dashboard(?:\/)?([?#].*)?$/, '/admin/dashboard$1'],
      [/^\/clientes(?:\/)?([?#].*)?$/, '/admin/clientes$1'],
      [/^\/clientes\/nuevo(?:\/)?([?#].*)?$/, '/admin/clientes/nuevo$1'],
      [/^\/clientes\/editar\/([^/?#]+)(.*)$/, '/admin/clientes/editar/$1$2'],
      [/^\/clientes\/([^/?#]+)\/historial(.*)$/, '/admin/clientes/$1/historial$2'],
      [/^\/eventos\/nuevo(?:\/)?([?#].*)?$/, '/admin/eventos/nuevo$1'],
      [/^\/eventos\/editar\/([^/?#]+)(.*)$/, '/admin/eventos/editar/$1$2'],
      [/^\/fotos\/metadata(?:\/)?([?#].*)?$/, '/admin/fotos/metadata$1'],
      [/^\/fotos\/editar\/([^/?#]+)(.*)$/, '/admin/fotos/editar/$1$2'],
      [/^\/pedidos(\/[^?#]*)?([?#].*)?$/, '/admin/pedidos$1$2'],
      [/^\/descargas(\/[^?#]*)?([?#].*)?$/, '/admin/descargas$1$2'],
      [/^\/notificaciones(\/[^?#]*)?([?#].*)?$/, '/admin/notificaciones$1$2'],
    ];

    for (const [pattern, replacement] of adminMappings) {
      if (pattern.test(returnUrl)) {
        return returnUrl.replace(pattern, replacement);
      }
    }

    return returnUrl.startsWith('/admin/') ? returnUrl : null;
  }
}
