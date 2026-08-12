import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AdminService } from '../../../core/services/admin.service';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-mi-perfil-admin',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ErrorAlertComponent, LoadingComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './mi-perfil-admin.component.html',
})
export class MiPerfilAdminComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = false;
  saving = false;
  submitted = false;
  error = '';
  success = '';

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(160)]],
    descripcion: ['', Validators.maxLength(1000)],
    whatsApp: ['', Validators.maxLength(64)],
    instagram: ['', Validators.maxLength(120)],
    correoPublico: ['', Validators.email],
    direccion: ['', Validators.maxLength(300)],
  });

  ngOnInit(): void {
    this.loading = true;

    this.adminService
      .getMiPerfil()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (perfil) => {
          this.form.patchValue({
            nombre: perfil.nombre,
            descripcion: perfil.descripcion ?? '',
            whatsApp: perfil.whatsApp ?? '',
            instagram: perfil.instagram ?? '',
            correoPublico: perfil.correoPublico ?? '',
            direccion: perfil.direccion ?? '',
          });
        },
        error: (error: unknown) => {
          this.error =
            error instanceof Error ? error.message : 'No se pudo cargar el perfil admin.';
        },
      });
  }

  submit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.saving = true;

    this.adminService
      .updateMiPerfil({
        nombre: raw.nombre.trim(),
        descripcion: raw.descripcion.trim() || undefined,
        whatsApp: raw.whatsApp.trim() || undefined,
        instagram: raw.instagram.trim() || undefined,
        correoPublico: raw.correoPublico.trim() || undefined,
        direccion: raw.direccion.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.success = 'Perfil publico actualizado.';
          this.saving = false;
          this.cdr.markForCheck();
        },
        error: (error: unknown) => {
          this.error = error instanceof Error ? error.message : 'No se pudo actualizar el perfil.';
          this.saving = false;
          this.cdr.markForCheck();
        },
      });
  }

  showError(controlName: 'nombre' | 'correoPublico'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted);
  }
}
