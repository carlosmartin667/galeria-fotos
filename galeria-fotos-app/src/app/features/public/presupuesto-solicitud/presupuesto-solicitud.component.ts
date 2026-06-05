import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

import { CrearSolicitudPresupuestoRequest } from '../../../core/models/presupuesto.models';
import { ServicioFotografia } from '../../../core/models/servicio.models';
import { PresupuestosService } from '../../../core/services/presupuestos.service';
import { SeoService } from '../../../core/services/seo.service';
import { ServiciosService } from '../../../core/services/servicios.service';
import { SitioPublicoService } from '../../../core/services/sitio-publico.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { AgendaDisponibilidadPublicaComponent } from '../disponibilidad/agenda-disponibilidad-publica.component';

type PresupuestoControl =
  | 'nombre'
  | 'email'
  | 'whatsApp'
  | 'tipoEvento'
  | 'servicioId'
  | 'fechaTentativa'
  | 'lugar'
  | 'cantidadInvitados'
  | 'mensaje';

@Component({
  selector: 'app-presupuesto-solicitud',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    EmptyStateComponent,
    ErrorAlertComponent,
    LoadingComponent,
    AgendaDisponibilidadPublicaComponent,
  ],
  templateUrl: './presupuesto-solicitud.component.html',
  styleUrl: './presupuesto-solicitud.component.css',
})
export class PresupuestoSolicitudComponent implements OnInit {
  private readonly presupuestosService = inject(PresupuestosService);
  private readonly serviciosService = inject(ServiciosService);
  private readonly sitioService = inject(SitioPublicoService);
  private readonly seo = inject(SeoService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  servicios: ServicioFotografia[] = [];
  whatsAppUrl = '';
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
  });

  ngOnInit(): void {
    this.seo.setPublicPage({
      title: 'Solicitar presupuesto',
      description:
        'Solicita un presupuesto para fotografia de eventos, sesiones privadas o servicios personalizados.',
      image: '/assets/caterserv/img/event-7.jpg',
    });
    this.loading = true;
    this.error = '';

    forkJoin({
      servicios: this.serviciosService.getPublicos(),
      contacto: this.sitioService.getContacto(),
    })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: ({ servicios, contacto }) => {
          this.servicios = servicios.filter((servicio) => servicio.activo !== false);
          this.whatsAppUrl = contacto.whatsAppUrl || contacto.perfil?.whatsAppUrl || '';
        },
        error: (error: unknown) => {
          this.error =
            error instanceof Error
              ? error.message
              : 'No se pudieron cargar los datos del formulario.';
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

    const request = this.toRequest();
    this.saving = true;
    this.presupuestosService
      .crearSolicitud(request)
      .pipe(
        finalize(() => {
          this.saving = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.success = 'Solicitud enviada. Te vamos a contactar para avanzar con el presupuesto.';
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
          });
        },
        error: (error: unknown) => {
          this.error = error instanceof Error ? error.message : 'No se pudo enviar la solicitud.';
        },
      });
  }

  showError(controlName: PresupuestoControl): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted);
  }

  trackById(index: number, item: ServicioFotografia): string {
    return item.id ?? String(index);
  }

  private toRequest(): CrearSolicitudPresupuestoRequest {
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
    };
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

    const normalized = trimmed.includes('T') ? trimmed : `${trimmed}T12:00`;
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
}
