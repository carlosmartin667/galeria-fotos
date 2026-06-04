import { DatePipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { CrearTestimonioRequest, Testimonio } from '../../../core/models/testimonio.models';
import { TestimoniosService } from '../../../core/services/testimonios.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

type TestimonioControl = 'nombreCliente' | 'emailCliente' | 'texto' | 'calificacion' | 'imagenUrl';

@Component({
  selector: 'app-testimonios-public',
  standalone: true,
  imports: [DatePipe, NgFor, NgIf, ReactiveFormsModule, EmptyStateComponent, ErrorAlertComponent, LoadingComponent],
  templateUrl: './testimonios-public.component.html',
  styleUrl: './testimonios-public.component.css'
})
export class TestimoniosPublicComponent implements OnInit {
  private readonly testimoniosService = inject(TestimoniosService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  testimonios: Testimonio[] = [];
  loading = false;
  saving = false;
  submitted = false;
  error = '';
  success = '';

  readonly form = this.fb.nonNullable.group({
    nombreCliente: ['', [Validators.required, Validators.maxLength(160)]],
    emailCliente: ['', [Validators.email, Validators.maxLength(256)]],
    texto: ['', [Validators.required, Validators.maxLength(2000)]],
    calificacion: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    imagenUrl: ['', Validators.maxLength(1000)]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.testimoniosService.getPublicos().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (items) => {
        this.testimonios = [...items].sort((a, b) => new Date(b.fechaPublicacionUtc ?? b.fechaCreacionUtc ?? '').getTime() - new Date(a.fechaPublicacionUtc ?? a.fechaCreacionUtc ?? '').getTime());
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudieron cargar testimonios.';
      }
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
    this.testimoniosService.crear(this.toPayload()).pipe(
      finalize(() => {
        this.saving = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.success = 'Gracias. Tu testimonio quedo pendiente de aprobacion.';
        this.submitted = false;
        this.form.reset({
          nombreCliente: '',
          emailCliente: '',
          texto: '',
          calificacion: 5,
          imagenUrl: ''
        });
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo enviar el testimonio.';
      }
    });
  }

  stars(value?: number | null): number[] {
    return Array.from({ length: Math.max(Math.min(Number(value ?? 0), 5), 0) }, (_, index) => index + 1);
  }

  showError(controlName: TestimonioControl): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted);
  }

  trackById(index: number, item: Testimonio): string {
    return item.id ?? String(index);
  }

  trackByStar(_: number, value: number): number {
    return value;
  }

  private toPayload(): CrearTestimonioRequest {
    const raw = this.form.getRawValue();
    return {
      nombreCliente: raw.nombreCliente.trim(),
      emailCliente: raw.emailCliente.trim() || null,
      texto: raw.texto.trim(),
      calificacion: Number(raw.calificacion),
      imagenUrl: raw.imagenUrl.trim() || null
    };
  }
}
