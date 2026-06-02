import { CurrencyPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { ActualizarCuponDescuentoRequest, CuponDescuento, CuponUso } from '../../../core/models/cupon.models';
import { CuponesService } from '../../../core/services/cupones.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

type CuponControl = 'codigo' | 'tipoDescuento' | 'valorDescuento' | 'fechaInicio' | 'fechaFin';

@Component({
  selector: 'app-cupones-admin',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgClass, NgFor, NgIf, ReactiveFormsModule, EmptyStateComponent, ErrorAlertComponent, LoadingComponent],
  templateUrl: './cupones-admin.component.html',
  styleUrl: './cupones-admin.component.css'
})
export class CuponesAdminComponent implements OnInit {
  private readonly cuponesService = inject(CuponesService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly tipos = ['Porcentaje', 'MontoFijo'];
  cupones: CuponDescuento[] = [];
  usos: CuponUso[] = [];
  usosCupon: CuponDescuento | null = null;
  editingId = '';
  loading = false;
  saving = false;
  actionId = '';
  submitted = false;
  error = '';
  success = '';
  formError = '';

  readonly form = this.fb.nonNullable.group({
    codigo: ['', [Validators.required, Validators.maxLength(64)]],
    descripcion: ['', Validators.maxLength(500)],
    tipoDescuento: ['Porcentaje', [Validators.required, Validators.maxLength(32)]],
    valorDescuento: [0, Validators.required],
    montoMinimoCompra: [null as number | null],
    montoMaximoDescuento: [null as number | null],
    fechaInicio: [''],
    fechaFin: [''],
    usosMaximos: [null as number | null],
    usosMaximosPorUsuario: [null as number | null],
    soloPrimerCompra: [false],
    activo: [true]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.cuponesService.getAdmin().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (items) => {
        this.cupones = [...items].sort((a, b) => (a.codigo ?? '').localeCompare(b.codigo ?? ''));
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudieron cargar cupones.';
      }
    });
  }

  edit(item: CuponDescuento): void {
    this.editingId = item.id;
    this.submitted = false;
    this.formError = '';
    this.error = '';
    this.success = '';
    this.form.reset({
      codigo: item.codigo ?? '',
      descripcion: item.descripcion ?? '',
      tipoDescuento: item.tipoDescuento ?? 'Porcentaje',
      valorDescuento: item.valorDescuento ?? 0,
      montoMinimoCompra: item.montoMinimoCompra ?? null,
      montoMaximoDescuento: item.montoMaximoDescuento ?? null,
      fechaInicio: this.toInputDate(item.fechaInicioUtc),
      fechaFin: this.toInputDate(item.fechaFinUtc),
      usosMaximos: item.usosMaximos ?? null,
      usosMaximosPorUsuario: item.usosMaximosPorUsuario ?? null,
      soloPrimerCompra: item.soloPrimerCompra === true,
      activo: item.activo !== false
    });
    this.form.controls.codigo.disable();
  }

  cancel(): void {
    this.editingId = '';
    this.submitted = false;
    this.formError = '';
    this.form.controls.codigo.enable();
    this.form.reset({
      codigo: '',
      descripcion: '',
      tipoDescuento: 'Porcentaje',
      valorDescuento: 0,
      montoMinimoCompra: null,
      montoMaximoDescuento: null,
      fechaInicio: '',
      fechaFin: '',
      usosMaximos: null,
      usosMaximosPorUsuario: null,
      soloPrimerCompra: false,
      activo: true
    });
  }

  submit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';
    this.formError = this.validateBusinessRules();

    if (this.form.invalid || this.formError) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.toPayload();
    const request = this.editingId
      ? this.cuponesService.actualizar(this.editingId, payload)
      : this.cuponesService.crear({ ...payload, codigo: this.form.getRawValue().codigo.trim() });

    this.saving = true;
    request.pipe(
      finalize(() => {
        this.saving = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.success = this.editingId ? 'Cupon actualizado.' : 'Cupon creado.';
        this.cancel();
        this.load();
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo guardar el cupon.';
      }
    });
  }

  cambiarActivo(item: CuponDescuento): void {
    if (!item.id) {
      return;
    }

    this.actionId = item.id;
    const request = item.activo === false ? this.cuponesService.activar(item.id) : this.cuponesService.desactivar(item.id);
    request.pipe(
      finalize(() => {
        this.actionId = '';
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.success = item.activo === false ? 'Cupon activado.' : 'Cupon desactivado.';
        this.load();
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo cambiar el estado del cupon.';
      }
    });
  }

  eliminar(item: CuponDescuento): void {
    if (!item.id || !confirm(`Eliminar el cupon ${item.codigo || item.id}?`)) {
      return;
    }

    this.actionId = item.id;
    this.cuponesService.eliminar(item.id).pipe(
      finalize(() => {
        this.actionId = '';
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.success = 'Cupon eliminado.';
        this.load();
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo eliminar el cupon.';
      }
    });
  }

  verUsos(item: CuponDescuento): void {
    if (!item.id) {
      return;
    }

    this.usosCupon = item;
    this.actionId = item.id;
    this.cuponesService.getUsos(item.id).pipe(
      finalize(() => {
        this.actionId = '';
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (usos) => {
        this.usos = usos;
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudieron cargar los usos del cupon.';
      }
    });
  }

  showError(controlName: CuponControl): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted);
  }

  tipoClass(tipo?: string | null): string {
    return (tipo ?? '').toLowerCase().includes('porcentaje') ? 'bg-info text-dark' : 'bg-primary';
  }

  trackById(index: number, item: CuponDescuento | CuponUso): string {
    return item.id ?? String(index);
  }

  private validateBusinessRules(): string {
    const raw = this.form.getRawValue();
    const tipo = raw.tipoDescuento.toLowerCase();
    const valor = Number(raw.valorDescuento);

    if (tipo.includes('porcentaje') && (valor < 1 || valor > 100)) {
      return 'El porcentaje debe estar entre 1 y 100.';
    }
    if (!tipo.includes('porcentaje') && valor <= 0) {
      return 'El monto fijo debe ser mayor a 0.';
    }
    if (raw.fechaInicio && raw.fechaFin && new Date(raw.fechaFin).getTime() <= new Date(raw.fechaInicio).getTime()) {
      return 'La fecha fin debe ser mayor a la fecha inicio.';
    }
    return '';
  }

  private toPayload(): ActualizarCuponDescuentoRequest {
    const raw = this.form.getRawValue();
    return {
      descripcion: raw.descripcion.trim() || null,
      tipoDescuento: raw.tipoDescuento.trim(),
      valorDescuento: Number(raw.valorDescuento || 0),
      montoMinimoCompra: this.numberOrNull(raw.montoMinimoCompra),
      montoMaximoDescuento: this.numberOrNull(raw.montoMaximoDescuento),
      fechaInicioUtc: this.toIso(raw.fechaInicio),
      fechaFinUtc: this.toIso(raw.fechaFin),
      usosMaximos: this.numberOrNull(raw.usosMaximos),
      usosMaximosPorUsuario: this.numberOrNull(raw.usosMaximosPorUsuario),
      soloPrimerCompra: raw.soloPrimerCompra,
      activo: raw.activo
    };
  }

  private numberOrNull(value: number | string | null | undefined): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
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
