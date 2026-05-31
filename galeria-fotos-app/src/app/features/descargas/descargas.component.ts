import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { LinkDescargaResponse } from '../../core/models/descarga.models';
import { DescargasService } from '../../core/services/descargas.service';
import { ErrorAlertComponent } from '../../shared/components/error-alert/error-alert.component';

@Component({
  selector: 'app-descargas',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, ErrorAlertComponent],
  templateUrl: './descargas.component.html'
})
export class DescargasComponent {
  private readonly descargasService = inject(DescargasService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = false;
  submitted = false;
  error = '';
  link: LinkDescargaResponse | null = null;

  readonly form = this.fb.nonNullable.group({
    pedidoId: ['', Validators.required],
    fotoId: ['', Validators.required]
  });

  submit(): void {
    this.submitted = true;
    this.error = '';
    this.link = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.loading = true;

    this.descargasService.createLink({
      pedidoId: raw.pedidoId.trim(),
      fotoId: raw.fotoId.trim()
    }).subscribe({
      next: (link) => {
        this.link = link;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo generar el link.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
