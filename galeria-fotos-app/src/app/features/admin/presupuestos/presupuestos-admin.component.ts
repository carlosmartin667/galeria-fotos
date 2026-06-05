import { DatePipe, NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import {
  CrearSolicitudPresupuestoRequest,
  SolicitudPresupuesto,
} from '../../../core/models/presupuesto.models';
import { PresupuestosService } from '../../../core/services/presupuestos.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

type PresupuestoFormControl =
  | 'nombre'
  | 'email'
  | 'whatsApp'
  | 'tipoEvento'
  | 'servicioId'
  | 'fechaTentativa'
  | 'lugar'
  | 'cantidadInvitados'
  | 'mensaje'
  | 'estado';

@Component({
  selector: 'app-presupuestos-admin',
  standalone: true,
  imports: [
    DatePipe,
    NgClass,
    RouterLink,
    ReactiveFormsModule,
    EmptyStateComponent,
    ErrorAlertComponent,
    LoadingComponent,
  ],
  templateUrl: './presupuestos-admin.component.html',
  styleUrl: './presupuestos-admin.component.css',
})
export class PresupuestosAdminComponent implements OnInit {
  private readonly presupuestosService = inject(PresupuestosService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly estados = [
    'Nuevo',
    'Contactado',
    'PresupuestoEnviado',
    'Aceptado',
    'Rechazado',
    'Cerrado',
  ];
  solicitudes: SolicitudPresupuesto[] = [];
  editingId = '';
  loading = false;
  saving = false;
  submitted = false;
  error = '';
  success = '';

  readonly filterForm = this.fb.nonNullable.group({
    activa: ['all'],
    search: [''],
  });

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(160)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
    whatsApp: ['', Validators.maxLength(64)],
    tipoEvento: ['', Validators.maxLength(120)],
    servicioId: [''],
    fechaTentativa: [''],
    lugar: ['', Validators.maxLength(240)],
    cantidadInvitados: [null as number | null, Validators.min(1)],
    mensaje: ['', [Validators.required, Validators.maxLength(2000)]],
    estado: ['Nuevo', [Validators.required, Validators.maxLength(64)]],
    activa: [true],
  });

  ngOnInit(): void {
    this.load();
  }

  get filteredSolicitudes(): SolicitudPresupuesto[] {
    const search = this.filterForm.controls.search.value.trim().toLowerCase();
    if (!search) {
      return this.solicitudes;
    }

    return this.solicitudes.filter((item) =>
      [item.nombre, item.email, item.whatsApp, item.tipoEvento, item.estado].some((value) =>
        (value ?? '').toLowerCase().includes(search),
      ),
    );
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.presupuestosService
      .getSolicitudes(this.activaParam())
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (solicitudes) => {
          this.solicitudes = [...solicitudes].sort(
            (a, b) =>
              new Date(b.fechaCreacionUtc ?? '').getTime() -
              new Date(a.fechaCreacionUtc ?? '').getTime(),
          );
        },
        error: (error: unknown) => {
          this.error =
            error instanceof Error ? error.message : 'No se pudieron cargar solicitudes.';
        },
      });
  }

  edit(item: SolicitudPresupuesto): void {
    this.editingId = item.id ?? '';
    this.submitted = false;
    this.error = '';
    this.success = '';
    this.form.patchValue({
      nombre: item.nombre,
      email: item.email,
      whatsApp: item.whatsApp ?? '',
      tipoEvento: item.tipoEvento ?? '',
      servicioId: item.servicioId ?? '',
      fechaTentativa: this.toInputDate(item.fechaTentativaUtc),
      lugar: item.lugar ?? '',
      cantidadInvitados: item.cantidadInvitados ?? null,
      mensaje: item.mensaje,
      estado: item.estado ?? 'Nuevo',
      activa: item.activa !== false,
    });
  }

  cancel(): void {
    this.editingId = '';
    this.submitted = false;
    this.form.reset({
      nombre: '',
      email: '',
      whatsApp: '',
      tipoEvento: '',
      servicioId: '',
      fechaTentativa: '',
      lugar: '',
      cantidadInvitados: null,
      mensaje: '',
      estado: 'Nuevo',
      activa: true,
    });
  }

  submit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';

    if (!this.editingId) {
      this.error = 'Selecciona una solicitud para editar.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.presupuestosService
      .actualizarSolicitud(this.editingId, this.toPayload())
      .pipe(
        finalize(() => {
          this.saving = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.success = 'Solicitud actualizada.';
          this.cancel();
          this.load();
        },
        error: (error: unknown) => {
          this.error = error instanceof Error ? error.message : 'No se pudo guardar la solicitud.';
        },
      });
  }

  cambiarEstado(item: SolicitudPresupuesto, event: Event): void {
    const estado = (event.target as HTMLSelectElement).value;
    if (!item.id || !estado) {
      return;
    }

    this.presupuestosService.cambiarEstado(item.id, estado).subscribe({
      next: () => {
        this.success = 'Estado actualizado.';
        this.load();
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo cambiar el estado.';
        this.cdr.markForCheck();
      },
    });
  }

  desactivar(item: SolicitudPresupuesto): void {
    if (!item.id || !confirm(`Cerrar o desactivar la solicitud de ${item.nombre}?`)) {
      return;
    }

    this.presupuestosService.eliminarSolicitud(item.id).subscribe({
      next: () => {
        this.success = 'Solicitud cerrada o desactivada.';
        this.load();
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo cerrar la solicitud.';
        this.cdr.markForCheck();
      },
    });
  }

  whatsAppLink(value?: string | null): string {
    const digits = (value ?? '').replace(/\D/g, '');
    return digits ? `https://wa.me/${digits}` : '';
  }

  estadoClass(estado?: string | null): string {
    const normalized = (estado ?? 'Nuevo').toLowerCase();
    if (normalized.includes('acept')) {
      return 'bg-success';
    }
    if (normalized.includes('rechaz') || normalized.includes('cerr')) {
      return 'bg-secondary';
    }
    if (normalized.includes('enviado') || normalized.includes('contact')) {
      return 'bg-info text-dark';
    }
    return 'bg-warning text-dark';
  }

  showError(controlName: PresupuestoFormControl): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted);
  }

  trackById(index: number, item: SolicitudPresupuesto): string {
    return item.id ?? String(index);
  }

  private activaParam(): boolean | null {
    const value = this.filterForm.controls.activa.value;
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
    return null;
  }

  private toPayload(): CrearSolicitudPresupuestoRequest & {
    estado?: string | null;
    activa: boolean;
  } {
    const raw = this.form.getRawValue();
    const cantidad =
      raw.cantidadInvitados === null || raw.cantidadInvitados === undefined
        ? null
        : Number(raw.cantidadInvitados);

    return {
      nombre: this.trim(raw.nombre),
      email: this.trim(raw.email),
      whatsApp: this.optional(raw.whatsApp),
      tipoEvento: this.optional(raw.tipoEvento),
      servicioId: this.optional(raw.servicioId),
      fechaTentativaUtc: this.toIsoOrNull(raw.fechaTentativa),
      lugar: this.optional(raw.lugar),
      cantidadInvitados: cantidad,
      mensaje: this.trim(raw.mensaje),
      estado: this.optional(raw.estado),
      activa: raw.activa === true,
    };
  }

  private toInputDate(value?: string | null): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toISOString().slice(0, 10);
  }

  private trim(value: string | null | undefined): string {
    return (value ?? '').trim();
  }

  private optional(value: string | null | undefined): string | null {
    const trimmed = this.trim(value);
    return trimmed || null;
  }

  private toIsoOrNull(value: string | null | undefined): string | null {
    const trimmed = this.trim(value);
    if (!trimmed) {
      return null;
    }

    const date = new Date(`${trimmed}T12:00`);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
}
