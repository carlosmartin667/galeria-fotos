import { DatePipe, NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { CrearPromocionRequest, Promocion } from '../../../core/models/promocion.models';
import { PromocionesService } from '../../../core/services/promociones.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

type PromocionControl = 'titulo' | 'tipo' | 'fechaInicio' | 'fechaFin';

@Component({
  selector: 'app-promociones-admin',
  standalone: true,
  imports: [
    DatePipe,
    NgClass,
    ReactiveFormsModule,
    EmptyStateComponent,
    ErrorAlertComponent,
    LoadingComponent,
  ],
  templateUrl: './promociones-admin.component.html',
  styleUrl: './promociones-admin.component.css',
})
export class PromocionesAdminComponent implements OnInit {
  private readonly promocionesService = inject(PromocionesService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  promociones: Promocion[] = [];
  editingId = '';
  loading = false;
  saving = false;
  actionId = '';
  submitted = false;
  error = '';
  formError = '';
  success = '';

  readonly form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(180)]],
    descripcion: ['', Validators.maxLength(1200)],
    imagenUrl: ['', Validators.maxLength(1000)],
    tipo: ['General', [Validators.required, Validators.maxLength(64)]],
    fechaInicio: [''],
    fechaFin: [''],
    activa: [true],
    destacada: [false],
    orden: [0],
    cuponDescuentoId: [''],
    servicioFotografiaId: [''],
    eventoId: [''],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.promocionesService
      .getAdmin()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (items) => {
          this.promociones = [...items].sort((a, b) => Number(a.orden ?? 0) - Number(b.orden ?? 0));
        },
        error: (error: unknown) => {
          this.error =
            error instanceof Error ? error.message : 'No se pudieron cargar promociones admin.';
        },
      });
  }

  edit(item: Promocion): void {
    this.editingId = item.id;
    this.submitted = false;
    this.formError = '';
    this.error = '';
    this.success = '';
    this.form.reset({
      titulo: item.titulo ?? '',
      descripcion: item.descripcion ?? '',
      imagenUrl: item.imagenUrl ?? '',
      tipo: item.tipo ?? 'General',
      fechaInicio: this.toInputDate(item.fechaInicioUtc),
      fechaFin: this.toInputDate(item.fechaFinUtc),
      activa: item.activa !== false,
      destacada: item.destacada === true || item.destacado === true,
      orden: item.orden ?? 0,
      cuponDescuentoId: item.cuponDescuentoId ?? '',
      servicioFotografiaId: item.servicioFotografiaId ?? '',
      eventoId: item.eventoId ?? '',
    });
  }

  cancel(): void {
    this.editingId = '';
    this.submitted = false;
    this.formError = '';
    this.form.reset({
      titulo: '',
      descripcion: '',
      imagenUrl: '',
      tipo: 'General',
      fechaInicio: '',
      fechaFin: '',
      activa: true,
      destacada: false,
      orden: 0,
      cuponDescuentoId: '',
      servicioFotografiaId: '',
      eventoId: '',
    });
  }

  submit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';
    this.formError = this.validateDates();

    if (this.form.invalid || this.formError) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.toPayload();
    const request = this.editingId
      ? this.promocionesService.actualizar(this.editingId, payload)
      : this.promocionesService.crear(payload);

    this.saving = true;
    request
      .pipe(
        finalize(() => {
          this.saving = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.success = this.editingId ? 'Promocion actualizada.' : 'Promocion creada.';
          this.cancel();
          this.load();
        },
        error: (error: unknown) => {
          this.error = error instanceof Error ? error.message : 'No se pudo guardar la promocion.';
        },
      });
  }

  cambiarActivo(item: Promocion): void {
    if (!item.id) {
      return;
    }

    this.actionId = item.id;
    const request =
      item.activa === false
        ? this.promocionesService.activar(item.id)
        : this.promocionesService.desactivar(item.id);
    request
      .pipe(
        finalize(() => {
          this.actionId = '';
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.success = item.activa === false ? 'Promocion activada.' : 'Promocion desactivada.';
          this.load();
        },
        error: (error: unknown) => {
          this.error =
            error instanceof Error
              ? error.message
              : 'No se pudo cambiar el estado de la promocion.';
        },
      });
  }

  eliminar(item: Promocion): void {
    if (!item.id || !confirm(`Eliminar "${item.titulo || item.id}"?`)) {
      return;
    }

    this.actionId = item.id;
    this.promocionesService
      .eliminar(item.id)
      .pipe(
        finalize(() => {
          this.actionId = '';
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.success = 'Promocion eliminada.';
          this.load();
        },
        error: (error: unknown) => {
          this.error = error instanceof Error ? error.message : 'No se pudo eliminar la promocion.';
        },
      });
  }

  showError(controlName: PromocionControl): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted);
  }

  trackById(index: number, item: Promocion): string {
    return item.id ?? String(index);
  }

  private toPayload(): CrearPromocionRequest {
    const raw = this.form.getRawValue();
    return {
      titulo: raw.titulo.trim(),
      descripcion: raw.descripcion.trim() || null,
      imagenUrl: raw.imagenUrl.trim() || null,
      tipo: raw.tipo.trim(),
      fechaInicioUtc: this.toIso(raw.fechaInicio),
      fechaFinUtc: this.toIso(raw.fechaFin),
      activa: raw.activa,
      destacada: raw.destacada,
      orden: Number(raw.orden || 0),
      cuponDescuentoId: raw.cuponDescuentoId.trim() || null,
      servicioFotografiaId: raw.servicioFotografiaId.trim() || null,
      eventoId: raw.eventoId.trim() || null,
    };
  }

  private validateDates(): string {
    const raw = this.form.getRawValue();
    if (
      raw.fechaInicio &&
      raw.fechaFin &&
      new Date(raw.fechaFin).getTime() <= new Date(raw.fechaInicio).getTime()
    ) {
      return 'La fecha fin debe ser mayor a la fecha inicio.';
    }
    return '';
  }

  private toIso(value: string | null | undefined): string | null {
    return value ? new Date(value).toISOString() : null;
  }

  private toInputDate(value?: string | null): string {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 16);
  }
}
