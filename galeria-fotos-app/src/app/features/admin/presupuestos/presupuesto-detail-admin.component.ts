import { DatePipe, NgClass } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { SolicitudPresupuesto } from '../../../core/models/presupuesto.models';
import { PresupuestosService } from '../../../core/services/presupuestos.service';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { NotasInternasComponent } from '../../../shared/components/notas-internas/notas-internas.component';

@Component({
  selector: 'app-presupuesto-detail-admin',
  standalone: true,
  imports: [
    DatePipe,
    NgClass,
    RouterLink,
    ReactiveFormsModule,
    ErrorAlertComponent,
    LoadingComponent,
    NotasInternasComponent,
  ],
  templateUrl: './presupuesto-detail-admin.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './presupuesto-detail-admin.component.css',
})
export class PresupuestoDetailAdminComponent implements OnInit {
  private readonly presupuestosService = inject(PresupuestosService);
  private readonly route = inject(ActivatedRoute);
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
  solicitud: SolicitudPresupuesto | null = null;
  loading = false;
  saving = false;
  submitted = false;
  error = '';
  success = '';

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

  load(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    if (!id) {
      this.error = 'No se encontro la solicitud.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';
    this.presupuestosService
      .getSolicitud(id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (solicitud) => {
          this.solicitud = solicitud;
          this.patchForm(solicitud);
        },
        error: (error: unknown) => {
          this.error = error instanceof Error ? error.message : 'No se pudo cargar la solicitud.';
        },
      });
  }

  submit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';

    if (!this.solicitud?.id) {
      this.error = 'No se encontro la solicitud.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.presupuestosService
      .actualizarSolicitud(this.solicitud.id, this.toPayload())
      .pipe(
        finalize(() => {
          this.saving = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (solicitud) => {
          this.success = 'Solicitud actualizada.';
          this.solicitud = solicitud;
          this.patchForm(solicitud);
        },
        error: (error: unknown) => {
          this.error = error instanceof Error ? error.message : 'No se pudo guardar la solicitud.';
        },
      });
  }

  cambiarEstado(): void {
    if (!this.solicitud?.id) {
      return;
    }

    const estado = this.form.controls.estado.value ?? 'Nuevo';
    this.presupuestosService.cambiarEstado(this.solicitud.id, estado).subscribe({
      next: () => {
        this.success = 'Estado actualizado.';
        this.load();
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo cambiar el estado.';
      },
    });
  }

  desactivar(): void {
    if (!this.solicitud?.id || !confirm('Cerrar o desactivar esta solicitud?')) {
      return;
    }

    this.presupuestosService.eliminarSolicitud(this.solicitud.id).subscribe({
      next: () => {
        this.success = 'Solicitud cerrada o desactivada.';
        this.load();
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo cerrar la solicitud.';
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

  private patchForm(solicitud: SolicitudPresupuesto): void {
    this.form.patchValue({
      nombre: solicitud.nombre,
      email: solicitud.email,
      whatsApp: solicitud.whatsApp ?? '',
      tipoEvento: solicitud.tipoEvento ?? '',
      servicioId: solicitud.servicioId ?? '',
      fechaTentativa: this.toInputDate(solicitud.fechaTentativaUtc),
      lugar: solicitud.lugar ?? '',
      cantidadInvitados: solicitud.cantidadInvitados ?? null,
      mensaje: solicitud.mensaje,
      estado: solicitud.estado ?? 'Nuevo',
      activa: solicitud.activa !== false,
    });
  }

  private toPayload() {
    const raw = this.form.getRawValue();
    return {
      nombre: this.trim(raw.nombre),
      email: this.trim(raw.email),
      whatsApp: this.optional(raw.whatsApp),
      tipoEvento: this.optional(raw.tipoEvento),
      servicioId: this.optional(raw.servicioId),
      fechaTentativaUtc: this.toIsoOrNull(raw.fechaTentativa),
      lugar: this.optional(raw.lugar),
      cantidadInvitados:
        raw.cantidadInvitados === null || raw.cantidadInvitados === undefined
          ? null
          : Number(raw.cantidadInvitados),
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
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
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
