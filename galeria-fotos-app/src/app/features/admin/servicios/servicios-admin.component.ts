import { CurrencyPipe, NgClass } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import {
  CrearServicioFotografiaRequest,
  ServicioFotografia,
} from '../../../core/models/servicio.models';
import { ServiciosService } from '../../../core/services/servicios.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-servicios-admin',
  standalone: true,
  imports: [
    CurrencyPipe,
    NgClass,
    ReactiveFormsModule,
    EmptyStateComponent,
    ErrorAlertComponent,
    LoadingComponent,
  ],
  templateUrl: './servicios-admin.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './servicios-admin.component.css',
})
export class ServiciosAdminComponent implements OnInit {
  private readonly serviciosService = inject(ServiciosService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  servicios: ServicioFotografia[] = [];
  editingId = '';
  loading = false;
  saving = false;
  submitted = false;
  error = '';
  success = '';

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(180)]],
    descripcion: ['', Validators.maxLength(1200)],
    precioDesde: [0, Validators.min(0)],
    duracionEstimada: ['', Validators.maxLength(120)],
    cantidadFotosIncluidas: [0, Validators.min(0)],
    imagenUrl: ['', Validators.maxLength(1000)],
    activo: [true],
    orden: [0],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.serviciosService
      .getAdmin()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (servicios) => {
          this.servicios = [...servicios].sort(
            (a, b) => Number(a.orden ?? 0) - Number(b.orden ?? 0),
          );
        },
        error: (error: unknown) => {
          this.error =
            error instanceof Error ? error.message : 'No se pudieron cargar servicios admin.';
        },
      });
  }

  edit(item: ServicioFotografia): void {
    this.editingId = item.id ?? '';
    this.submitted = false;
    this.error = '';
    this.success = '';
    this.form.patchValue({
      nombre: item.nombre,
      descripcion: item.descripcion ?? '',
      precioDesde: item.precioDesde ?? 0,
      duracionEstimada: item.duracionEstimada ?? '',
      cantidadFotosIncluidas: item.cantidadFotosIncluidas ?? 0,
      imagenUrl: item.imagenUrl ?? '',
      activo: item.activo !== false,
      orden: item.orden ?? 0,
    });
  }

  cancel(): void {
    this.editingId = '';
    this.submitted = false;
    this.form.reset({
      nombre: '',
      descripcion: '',
      precioDesde: 0,
      duracionEstimada: '',
      cantidadFotosIncluidas: 0,
      imagenUrl: '',
      activo: true,
      orden: 0,
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

    const payload = this.toPayload();
    const request = this.editingId
      ? this.serviciosService.actualizar(this.editingId, payload)
      : this.serviciosService.crear(payload);

    this.saving = true;
    request.subscribe({
      next: () => {
        this.success = this.editingId ? 'Servicio actualizado.' : 'Servicio creado.';
        this.saving = false;
        this.cancel();
        this.load();
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo guardar el servicio.';
        this.saving = false;
        this.cdr.markForCheck();
      },
    });
  }

  eliminar(item: ServicioFotografia): void {
    if (!item.id || !confirm(`Eliminar "${item.nombre}"?`)) {
      return;
    }

    this.serviciosService.eliminar(item.id).subscribe({
      next: () => this.load(),
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo eliminar el servicio.';
      },
    });
  }

  showError(controlName: 'nombre' | 'precioDesde' | 'cantidadFotosIncluidas'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted);
  }

  trackById(index: number, item: ServicioFotografia): string {
    return item.id ?? String(index);
  }

  private toPayload(): CrearServicioFotografiaRequest {
    const raw = this.form.getRawValue();
    return {
      nombre: raw.nombre.trim(),
      descripcion: raw.descripcion.trim() || null,
      precioDesde:
        raw.precioDesde === null || raw.precioDesde === undefined ? null : Number(raw.precioDesde),
      duracionEstimada: raw.duracionEstimada.trim() || null,
      cantidadFotosIncluidas:
        raw.cantidadFotosIncluidas === null || raw.cantidadFotosIncluidas === undefined
          ? null
          : Number(raw.cantidadFotosIncluidas),
      imagenUrl: raw.imagenUrl.trim() || null,
      activo: raw.activo,
      orden: Number(raw.orden || 0),
    };
  }
}
