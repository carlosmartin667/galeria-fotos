import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ActualizarEventoRequest, CrearEventoRequest } from '../../../core/models/evento.models';
import { EventosService } from '../../../core/services/eventos.service';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-evento-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ErrorAlertComponent, LoadingComponent],
  templateUrl: './evento-form.component.html',
})
export class EventoFormComponent implements OnInit {
  private readonly eventosService = inject(EventosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  id: string | null = null;
  loading = false;
  saving = false;
  submitted = false;
  error = '';
  readonly estadoOptions = ['Borrador', 'Publicado', 'Finalizado', 'Archivado'];
  readonly visibilidadOptions = ['Publico', 'Privado', 'Oculto'];

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(180)]],
    descripcion: ['', Validators.maxLength(1000)],
    fechaEventoUtc: ['', Validators.required],
    estado: ['Borrador', [Validators.required, Validators.maxLength(64)]],
    visibilidad: ['Publico', Validators.maxLength(64)],
    fechaLimiteCompraUtc: [''],
    activo: [true],
    clientePrincipalId: [''],
  });

  get isEdit(): boolean {
    return Boolean(this.id);
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');

    if (!this.id) {
      return;
    }

    this.loading = true;
    this.eventosService
      .get(this.id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (evento) => {
          this.form.patchValue({
            nombre: evento.nombre,
            descripcion: evento.descripcion ?? '',
            fechaEventoUtc: this.toLocalInput(evento.fechaEventoUtc),
            estado: evento.estado ?? 'Borrador',
            visibilidad: evento.visibilidad ?? 'Publico',
            fechaLimiteCompraUtc: evento.fechaLimiteCompraUtc
              ? this.toLocalInput(evento.fechaLimiteCompraUtc)
              : '',
            activo: evento.activo !== false,
            clientePrincipalId: evento.clientePrincipalId ?? '',
          });
        },
        error: (error: unknown) => {
          this.error = this.message(error);
        },
      });
  }

  submit(): void {
    this.submitted = true;
    this.error = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const basePayload: CrearEventoRequest = {
      nombre: raw.nombre.trim(),
      descripcion: raw.descripcion.trim() || undefined,
      fechaEventoUtc: new Date(raw.fechaEventoUtc).toISOString(),
      estado: raw.estado.trim() || undefined,
      visibilidad: raw.visibilidad.trim() || undefined,
      fechaLimiteCompraUtc: raw.fechaLimiteCompraUtc
        ? new Date(raw.fechaLimiteCompraUtc).toISOString()
        : undefined,
      clientePrincipalId: raw.clientePrincipalId.trim() || undefined,
    };
    const request = this.id
      ? this.eventosService.update(this.id, {
          ...basePayload,
          estado: raw.estado.trim(),
          activo: raw.activo,
        } satisfies ActualizarEventoRequest)
      : this.eventosService.create(basePayload);

    this.saving = true;
    request.subscribe({
      next: () => void this.router.navigate(['/eventos']),
      error: (error: unknown) => {
        this.error = this.message(error);
        this.saving = false;
        this.cdr.markForCheck();
      },
    });
  }

  showError(controlName: 'nombre' | 'fechaEventoUtc' | 'estado'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted);
  }

  private toLocalInput(value: string): string {
    const date = new Date(value);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'No se pudo guardar el evento.';
  }
}
