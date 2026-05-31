import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { EventosService } from '../../../api/eventos.service';
import { ActualizarEventoRequestDto, CrearEventoRequestDto } from '../../../api/models';

@Component({
  selector: 'app-evento-form',
  standalone: false,
  templateUrl: './evento-form.component.html'
})
export class EventoFormComponent implements OnInit {
  private readonly eventosService = inject(EventosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  id: string | null = null;
  loading = false;
  saving = false;
  error = '';

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(180)]],
    descripcion: ['', Validators.maxLength(1000)],
    fechaEventoUtc: ['', Validators.required],
    estado: ['Borrador', [Validators.required, Validators.maxLength(64)]],
    clientePrincipalId: ['']
  });

  get isEdit(): boolean {
    return this.id !== null;
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');

    if (this.id) {
      this.loading = true;
      this.eventosService.get(this.id).subscribe({
        next: (evento) => {
          this.form.patchValue({
            nombre: evento.nombre,
            descripcion: evento.descripcion ?? '',
            fechaEventoUtc: this.toDateTimeLocal(evento.fechaEventoUtc),
            estado: evento.estado ?? 'Borrador',
            clientePrincipalId: evento.clientePrincipalId ?? ''
          });
          this.loading = false;
        },
        error: (error: unknown) => {
          this.error = this.message(error);
          this.loading = false;
        }
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const basePayload: CrearEventoRequestDto = {
      nombre: raw.nombre.trim(),
      descripcion: raw.descripcion.trim() || null,
      fechaEventoUtc: new Date(raw.fechaEventoUtc).toISOString(),
      clientePrincipalId: raw.clientePrincipalId.trim() || null
    };
    const request = this.id
      ? this.eventosService.update(this.id, {
          ...basePayload,
          estado: raw.estado.trim()
        } satisfies ActualizarEventoRequestDto)
      : this.eventosService.create(basePayload);

    this.saving = true;
    this.error = '';

    request.subscribe({
      next: () => void this.router.navigate(['/admin/eventos']),
      error: (error: unknown) => {
        this.error = this.message(error);
        this.saving = false;
      }
    });
  }

  private toDateTimeLocal(value: string): string {
    const date = new Date(value);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'No se pudo guardar el evento.';
  }
}
