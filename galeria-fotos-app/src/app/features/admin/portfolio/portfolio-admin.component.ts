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

import { CrearPortfolioItemRequest, PortfolioItem } from '../../../core/models/portfolio.models';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-portfolio-admin',
  standalone: true,
  imports: [
    DatePipe,
    NgClass,
    ReactiveFormsModule,
    EmptyStateComponent,
    ErrorAlertComponent,
    LoadingComponent,
  ],
  templateUrl: './portfolio-admin.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './portfolio-admin.component.css',
})
export class PortfolioAdminComponent implements OnInit {
  private readonly portfolioService = inject(PortfolioService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  items: PortfolioItem[] = [];
  editingId = '';
  loading = false;
  saving = false;
  submitted = false;
  error = '';
  success = '';

  readonly form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(180)]],
    descripcion: ['', Validators.maxLength(1000)],
    imagenUrl: ['', Validators.maxLength(1000)],
    categoria: ['', Validators.maxLength(120)],
    orden: [0],
    destacado: [false],
    activo: [true],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.portfolioService
      .getAdmin()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (items) => {
          this.items = [...items].sort((a, b) => Number(a.orden ?? 0) - Number(b.orden ?? 0));
        },
        error: (error: unknown) => {
          this.error =
            error instanceof Error ? error.message : 'No se pudo cargar Portfolio admin.';
        },
      });
  }

  edit(item: PortfolioItem): void {
    this.editingId = item.id ?? '';
    this.submitted = false;
    this.error = '';
    this.success = '';
    this.form.patchValue({
      titulo: item.titulo,
      descripcion: item.descripcion ?? '',
      imagenUrl: item.imagenUrl ?? '',
      categoria: item.categoria ?? '',
      orden: item.orden ?? 0,
      destacado: item.destacado === true,
      activo: item.activo !== false,
    });
  }

  cancel(): void {
    this.editingId = '';
    this.submitted = false;
    this.form.reset({
      titulo: '',
      descripcion: '',
      imagenUrl: '',
      categoria: '',
      orden: 0,
      destacado: false,
      activo: true,
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
      ? this.portfolioService.actualizar(this.editingId, payload)
      : this.portfolioService.crear(payload);

    this.saving = true;
    request.subscribe({
      next: () => {
        this.success = this.editingId ? 'Portfolio actualizado.' : 'Portfolio creado.';
        this.saving = false;
        this.cancel();
        this.load();
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo guardar Portfolio.';
        this.saving = false;
        this.cdr.markForCheck();
      },
    });
  }

  eliminar(item: PortfolioItem): void {
    if (!item.id || !confirm(`Eliminar "${item.titulo}"?`)) {
      return;
    }

    this.portfolioService.eliminar(item.id).subscribe({
      next: () => this.load(),
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo eliminar Portfolio.';
      },
    });
  }

  showError(controlName: 'titulo'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted);
  }

  trackById(index: number, item: PortfolioItem): string {
    return item.id ?? String(index);
  }

  private toPayload(): CrearPortfolioItemRequest {
    const raw = this.form.getRawValue();
    return {
      titulo: raw.titulo.trim(),
      descripcion: raw.descripcion.trim() || null,
      imagenUrl: raw.imagenUrl.trim() || null,
      categoria: raw.categoria.trim() || null,
      orden: Number(raw.orden || 0),
      destacado: raw.destacado,
      activo: raw.activo,
    };
  }
}
