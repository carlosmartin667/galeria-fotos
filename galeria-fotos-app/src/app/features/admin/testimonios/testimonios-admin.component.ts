import { DatePipe, NgClass } from '@angular/common';
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
  ActualizarTestimonioAdminRequest,
  Testimonio,
} from '../../../core/models/testimonio.models';
import { TestimoniosService } from '../../../core/services/testimonios.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

type TestimonioControl = 'nombreCliente' | 'emailCliente' | 'texto' | 'calificacion';

@Component({
  selector: 'app-testimonios-admin',
  standalone: true,
  imports: [
    DatePipe,
    NgClass,
    ReactiveFormsModule,
    EmptyStateComponent,
    ErrorAlertComponent,
    LoadingComponent,
  ],
  templateUrl: './testimonios-admin.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './testimonios-admin.component.css',
})
export class TestimoniosAdminComponent implements OnInit {
  private readonly testimoniosService = inject(TestimoniosService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  testimonios: Testimonio[] = [];
  editingId = '';
  loading = false;
  saving = false;
  actionId = '';
  submitted = false;
  error = '';
  success = '';

  readonly form = this.fb.nonNullable.group({
    nombreCliente: ['', [Validators.required, Validators.maxLength(160)]],
    emailCliente: ['', [Validators.email, Validators.maxLength(256)]],
    texto: ['', [Validators.required, Validators.maxLength(2000)]],
    calificacion: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    imagenUrl: ['', Validators.maxLength(1000)],
    publicado: [false],
    destacado: [false],
    activo: [true],
    clienteId: [''],
    pedidoId: [''],
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

    this.testimoniosService
      .getAdmin()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (items) => {
          this.testimonios = [...items].sort(
            (a, b) =>
              new Date(b.fechaCreacionUtc ?? '').getTime() -
              new Date(a.fechaCreacionUtc ?? '').getTime(),
          );
        },
        error: (error: unknown) => {
          this.error =
            error instanceof Error ? error.message : 'No se pudieron cargar testimonios admin.';
        },
      });
  }

  edit(item: Testimonio): void {
    if (!item.id) {
      return;
    }

    this.actionId = item.id;
    this.testimoniosService
      .getAdminById(item.id)
      .pipe(
        finalize(() => {
          this.actionId = '';
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (detail) => {
          this.editingId = detail.id;
          this.submitted = false;
          this.form.reset({
            nombreCliente: detail.nombreCliente ?? '',
            emailCliente: detail.emailCliente ?? '',
            texto: detail.texto ?? '',
            calificacion: detail.calificacion ?? 5,
            imagenUrl: detail.imagenUrl ?? '',
            publicado: detail.publicado === true,
            destacado: detail.destacado === true || detail.destacada === true,
            activo: detail.activo !== false,
            clienteId: detail.clienteId ?? '',
            pedidoId: detail.pedidoId ?? '',
            servicioFotografiaId: detail.servicioFotografiaId ?? '',
            eventoId: detail.eventoId ?? '',
          });
        },
        error: (error: unknown) => {
          this.error =
            error instanceof Error ? error.message : 'No se pudo cargar el detalle del testimonio.';
        },
      });
  }

  cancel(): void {
    this.editingId = '';
    this.submitted = false;
    this.form.reset({
      nombreCliente: '',
      emailCliente: '',
      texto: '',
      calificacion: 5,
      imagenUrl: '',
      publicado: false,
      destacado: false,
      activo: true,
      clienteId: '',
      pedidoId: '',
      servicioFotografiaId: '',
      eventoId: '',
    });
  }

  submit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';

    if (!this.editingId) {
      this.error = 'Selecciona un testimonio para editar.';
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.testimoniosService
      .actualizarAdmin(this.editingId, this.toPayload())
      .pipe(
        finalize(() => {
          this.saving = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.success = 'Testimonio actualizado.';
          this.cancel();
          this.load();
        },
        error: (error: unknown) => {
          this.error =
            error instanceof Error ? error.message : 'No se pudo actualizar el testimonio.';
        },
      });
  }

  publicar(item: Testimonio): void {
    this.runAction(item, true);
  }

  ocultar(item: Testimonio): void {
    this.runAction(item, false);
  }

  eliminar(item: Testimonio): void {
    if (!item.id || !confirm(`Eliminar testimonio de ${item.nombreCliente || item.id}?`)) {
      return;
    }

    this.actionId = item.id;
    this.testimoniosService
      .eliminar(item.id)
      .pipe(
        finalize(() => {
          this.actionId = '';
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.success = 'Testimonio eliminado.';
          this.load();
        },
        error: (error: unknown) => {
          this.error =
            error instanceof Error ? error.message : 'No se pudo eliminar el testimonio.';
        },
      });
  }

  showError(controlName: TestimonioControl): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted);
  }

  stars(value?: number | null): number[] {
    return Array.from(
      { length: Math.max(Math.min(Number(value ?? 0), 5), 0) },
      (_, index) => index + 1,
    );
  }

  trackById(index: number, item: Testimonio): string {
    return item.id ?? String(index);
  }

  trackByStar(_: number, value: number): number {
    return value;
  }

  private runAction(item: Testimonio, publish: boolean): void {
    if (!item.id) {
      return;
    }

    this.actionId = item.id;
    const request = publish
      ? this.testimoniosService.publicar(item.id)
      : this.testimoniosService.ocultar(item.id);
    request
      .pipe(
        finalize(() => {
          this.actionId = '';
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.success = publish ? 'Testimonio publicado.' : 'Testimonio ocultado.';
          this.load();
        },
        error: (error: unknown) => {
          this.error =
            error instanceof Error ? error.message : 'No se pudo cambiar el estado del testimonio.';
        },
      });
  }

  private toPayload(): ActualizarTestimonioAdminRequest {
    const raw = this.form.getRawValue();
    return {
      nombreCliente: raw.nombreCliente.trim(),
      emailCliente: raw.emailCliente.trim() || null,
      texto: raw.texto.trim(),
      calificacion: Number(raw.calificacion),
      imagenUrl: raw.imagenUrl.trim() || null,
      publicado: raw.publicado,
      destacado: raw.destacado,
      activo: raw.activo,
      clienteId: raw.clienteId.trim() || null,
      pedidoId: raw.pedidoId.trim() || null,
      servicioFotografiaId: raw.servicioFotografiaId.trim() || null,
      eventoId: raw.eventoId.trim() || null,
    };
  }
}
