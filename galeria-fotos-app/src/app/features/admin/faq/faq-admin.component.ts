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

import { CrearPreguntaFrecuenteRequest, PreguntaFrecuente } from '../../../core/models/faq.models';
import { FaqService } from '../../../core/services/faq.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-faq-admin',
  standalone: true,
  imports: [
    DatePipe,
    NgClass,
    ReactiveFormsModule,
    EmptyStateComponent,
    ErrorAlertComponent,
    LoadingComponent,
  ],
  templateUrl: './faq-admin.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './faq-admin.component.css',
})
export class FaqAdminComponent implements OnInit {
  private readonly faqService = inject(FaqService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  preguntas: PreguntaFrecuente[] = [];
  editingId = '';
  loading = false;
  saving = false;
  submitted = false;
  error = '';
  success = '';

  readonly form = this.fb.nonNullable.group({
    pregunta: ['', [Validators.required, Validators.maxLength(220)]],
    respuesta: ['', [Validators.required, Validators.maxLength(2000)]],
    categoria: ['', Validators.maxLength(120)],
    orden: [0],
    activa: [true],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.faqService
      .getAdmin()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (preguntas) => {
          this.preguntas = [...preguntas].sort(
            (a, b) => Number(a.orden ?? 0) - Number(b.orden ?? 0),
          );
        },
        error: (error: unknown) => {
          this.error = error instanceof Error ? error.message : 'No se pudo cargar FAQ admin.';
        },
      });
  }

  edit(item: PreguntaFrecuente): void {
    this.editingId = item.id ?? '';
    this.submitted = false;
    this.error = '';
    this.success = '';
    this.form.patchValue({
      pregunta: item.pregunta,
      respuesta: item.respuesta,
      categoria: item.categoria ?? '',
      orden: item.orden ?? 0,
      activa: item.activa !== false,
    });
  }

  cancel(): void {
    this.editingId = '';
    this.submitted = false;
    this.form.reset({
      pregunta: '',
      respuesta: '',
      categoria: '',
      orden: 0,
      activa: true,
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
      ? this.faqService.actualizar(this.editingId, payload)
      : this.faqService.crear(payload);

    this.saving = true;
    request.subscribe({
      next: () => {
        this.success = this.editingId ? 'Pregunta actualizada.' : 'Pregunta creada.';
        this.saving = false;
        this.cancel();
        this.load();
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo guardar FAQ.';
        this.saving = false;
        this.cdr.markForCheck();
      },
    });
  }

  eliminar(item: PreguntaFrecuente): void {
    if (!item.id || !confirm(`Eliminar "${item.pregunta}"?`)) {
      return;
    }

    this.faqService.eliminar(item.id).subscribe({
      next: () => this.load(),
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo eliminar FAQ.';
      },
    });
  }

  showError(controlName: 'pregunta' | 'respuesta'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted);
  }

  trackById(index: number, item: PreguntaFrecuente): string {
    return item.id ?? String(index);
  }

  private toPayload(): CrearPreguntaFrecuenteRequest {
    const raw = this.form.getRawValue();
    return {
      pregunta: raw.pregunta.trim(),
      respuesta: raw.respuesta.trim(),
      categoria: raw.categoria.trim() || null,
      orden: Number(raw.orden || 0),
      activa: raw.activa,
    };
  }
}
