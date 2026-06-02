import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import {
  ActualizarPlantillaNotificacionRequest,
  CrearPlantillaNotificacionRequest,
  PlantillaNotificacion
} from '../../../../core/models/notificacion.models';
import { NotificacionesService } from '../../../../core/services/notificaciones.service';
import { redactSensitiveText } from '../../../../core/utils/sensitive-text';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';

type PlantillaFormControl = 'codigo' | 'canal' | 'asunto' | 'cuerpoHtml' | 'cuerpoTexto';

@Component({
  selector: 'app-plantillas-admin',
  standalone: true,
  imports: [DatePipe, NgClass, NgFor, NgIf, ReactiveFormsModule, EmptyStateComponent, ErrorAlertComponent, LoadingComponent],
  templateUrl: './plantillas-admin.component.html',
  styleUrl: './plantillas-admin.component.css'
})
export class PlantillasAdminComponent implements OnInit {
  private readonly notificacionesService = inject(NotificacionesService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly variables = [
    '{{NombreCliente}}',
    '{{EmailCliente}}',
    '{{NombreEvento}}',
    '{{PedidoId}}',
    '{{Total}}',
    '{{Estado}}',
    '{{Link}}',
    '{{NombreFotografa}}',
    '{{Fecha}}'
  ];

  plantillas: PlantillaNotificacion[] = [];
  editing: PlantillaNotificacion | null = null;
  loading = false;
  saving = false;
  actionId = '';
  submitted = false;
  error = '';
  success = '';

  readonly form = this.fb.nonNullable.group({
    codigo: ['', [Validators.required, Validators.maxLength(120)]],
    canal: ['Email', [Validators.required, Validators.maxLength(40)]],
    asunto: ['', [Validators.required, Validators.maxLength(240)]],
    cuerpoHtml: ['', [Validators.required, Validators.maxLength(12000)]],
    cuerpoTexto: ['', Validators.maxLength(12000)],
    activa: [true]
  });

  ngOnInit(): void {
    this.load();
  }

  get formTitle(): string {
    return this.editing?.id ? 'Editar plantilla' : 'Crear plantilla';
  }

  get safeHtmlPreview(): string {
    return redactSensitiveText(this.form.controls.cuerpoHtml.value || 'Sin cuerpo HTML.');
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.notificacionesService.getPlantillas().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (items) => {
        this.plantillas = [...items].sort((a, b) => (a.codigo ?? '').localeCompare(b.codigo ?? ''));
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudieron cargar las plantillas.';
      }
    });
  }

  edit(item: PlantillaNotificacion): void {
    this.editing = item;
    this.submitted = false;
    this.error = '';
    this.success = '';
    this.form.reset({
      codigo: item.codigo ?? '',
      canal: item.canal ?? 'Email',
      asunto: item.asunto ?? '',
      cuerpoHtml: item.cuerpoHtml ?? '',
      cuerpoTexto: item.cuerpoTexto ?? '',
      activa: item.activa !== false
    });
    this.form.controls.codigo.disable();
  }

  cancel(): void {
    this.editing = null;
    this.submitted = false;
    this.error = '';
    this.form.controls.codigo.enable();
    this.form.reset({
      codigo: '',
      canal: 'Email',
      asunto: '',
      cuerpoHtml: '',
      cuerpoTexto: '',
      activa: true
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

    this.saving = true;
    const request = this.editing?.id ? this.toUpdatePayload() : this.toCreatePayload();
    const operation = this.editing?.id
      ? this.notificacionesService.actualizarPlantilla(this.editing.id, request as ActualizarPlantillaNotificacionRequest)
      : this.notificacionesService.crearPlantilla(request as CrearPlantillaNotificacionRequest);

    operation.pipe(
      finalize(() => {
        this.saving = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.success = this.editing?.id ? 'Plantilla actualizada.' : 'Plantilla creada.';
        this.cancel();
        this.load();
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo guardar la plantilla.';
      }
    });
  }

  activar(item: PlantillaNotificacion): void {
    if (!item.id) {
      return;
    }

    this.runStateAction(item.id, item.activa === false ? 'activar' : 'desactivar');
  }

  text(value: unknown): string {
    return redactSensitiveText(value);
  }

  showError(controlName: PlantillaFormControl): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted);
  }

  canalClass(canal?: string | null): string {
    return (canal ?? '').toLowerCase().includes('email') ? 'bg-primary' : 'bg-light text-dark border';
  }

  trackById(index: number, item: PlantillaNotificacion): string {
    return item.id ?? item.codigo ?? String(index);
  }

  trackByVariable(_: number, variable: string): string {
    return variable;
  }

  private runStateAction(id: string, action: 'activar' | 'desactivar'): void {
    this.actionId = id;
    const request = action === 'activar'
      ? this.notificacionesService.activarPlantilla(id)
      : this.notificacionesService.desactivarPlantilla(id);

    request.pipe(
      finalize(() => {
        this.actionId = '';
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.success = action === 'activar' ? 'Plantilla activada.' : 'Plantilla desactivada.';
        this.load();
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo cambiar el estado de la plantilla.';
      }
    });
  }

  private toCreatePayload(): CrearPlantillaNotificacionRequest {
    const raw = this.form.getRawValue();
    return {
      codigo: raw.codigo.trim(),
      canal: raw.canal.trim(),
      asunto: raw.asunto.trim(),
      cuerpoHtml: raw.cuerpoHtml.trim(),
      cuerpoTexto: this.optional(raw.cuerpoTexto),
      activa: raw.activa
    };
  }

  private toUpdatePayload(): ActualizarPlantillaNotificacionRequest {
    const raw = this.form.getRawValue();
    return {
      canal: raw.canal.trim(),
      asunto: raw.asunto.trim(),
      cuerpoHtml: raw.cuerpoHtml.trim(),
      cuerpoTexto: this.optional(raw.cuerpoTexto),
      activa: raw.activa
    };
  }

  private optional(value: string | null | undefined): string | null {
    const trimmed = (value ?? '').trim();
    return trimmed || null;
  }
}
