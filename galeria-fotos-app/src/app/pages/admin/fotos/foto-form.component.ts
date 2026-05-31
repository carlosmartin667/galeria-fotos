import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { FotosService } from '../../../api/fotos.service';
import { ActualizarFotoRequestDto, CrearFotoMetadataRequestDto } from '../../../api/models';

@Component({
  selector: 'app-foto-form',
  standalone: false,
  templateUrl: './foto-form.component.html'
})
export class FotoFormComponent implements OnInit {
  private readonly fotosService = inject(FotosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  id: string | null = null;
  loading = false;
  saving = false;
  generatingKey = false;
  error = '';

  readonly form = this.fb.group({
    eventoId: ['', Validators.required],
    nombreArchivo: ['', [Validators.required, Validators.maxLength(260)]],
    contentType: ['image/jpeg', [Validators.required, Validators.maxLength(120)]],
    storageKey: ['', [Validators.required, Validators.maxLength(700)]],
    previewUrl: ['', Validators.maxLength(1000)],
    marcaAguaStorageKey: ['', Validators.maxLength(700)],
    sizeInBytes: [0],
    width: [null as number | null],
    height: [null as number | null],
    precioUnitario: [0],
    activa: [true]
  });

  get isEdit(): boolean {
    return this.id !== null;
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    const eventoId = this.route.snapshot.queryParamMap.get('eventoId');

    if (eventoId) {
      this.form.patchValue({ eventoId });
    }

    if (this.id) {
      this.form.controls.contentType.clearValidators();
      this.form.controls.storageKey.clearValidators();
      this.form.controls.contentType.updateValueAndValidity();
      this.form.controls.storageKey.updateValueAndValidity();
      this.loading = true;

      this.fotosService.get(this.id).subscribe({
        next: (foto) => {
          this.form.patchValue({
            eventoId: foto.eventoId,
            nombreArchivo: foto.nombreArchivo,
            contentType: foto.contentType ?? '',
            storageKey: foto.storageKey ?? '',
            previewUrl: foto.previewUrl ?? '',
            marcaAguaStorageKey: foto.marcaAguaStorageKey ?? '',
            sizeInBytes: foto.sizeInBytes ?? 0,
            width: foto.width ?? null,
            height: foto.height ?? null,
            precioUnitario: foto.precioUnitario ?? 0,
            activa: foto.activa !== false
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

  generateStorageKey(): void {
    const eventoId = this.text(this.form.controls.eventoId.value);
    const nombreArchivo = this.text(this.form.controls.nombreArchivo.value);

    if (!eventoId || !nombreArchivo) {
      this.error = 'Completa eventoId y nombreArchivo antes de generar la storage key.';
      return;
    }

    this.generatingKey = true;
    this.error = '';

    this.fotosService.generateStorageKey({ eventoId, nombreArchivo }).subscribe({
      next: (response) => {
        this.form.patchValue({ storageKey: response.storageKey ?? response.key ?? '' });
        this.generatingKey = false;
      },
      error: (error: unknown) => {
        this.error = this.message(error);
        this.generatingKey = false;
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const request = this.id
      ? this.fotosService.update(this.id, this.toUpdatePayload(raw))
      : this.fotosService.createMetadata(this.toCreatePayload(raw));

    this.saving = true;
    this.error = '';

    request.subscribe({
      next: (foto) => void this.router.navigate(['/admin/fotos'], { queryParams: { eventoId: foto.eventoId ?? raw.eventoId } }),
      error: (error: unknown) => {
        this.error = this.message(error);
        this.saving = false;
      }
    });
  }

  private toCreatePayload(raw: ReturnType<typeof this.form.getRawValue>): CrearFotoMetadataRequestDto {
    return {
      eventoId: this.text(raw.eventoId),
      nombreArchivo: this.text(raw.nombreArchivo),
      contentType: this.text(raw.contentType),
      storageKey: this.text(raw.storageKey),
      previewUrl: this.nullableText(raw.previewUrl),
      marcaAguaStorageKey: this.nullableText(raw.marcaAguaStorageKey),
      sizeInBytes: Number(raw.sizeInBytes ?? 0),
      width: this.numberOrNull(raw.width),
      height: this.numberOrNull(raw.height),
      precioUnitario: Number(raw.precioUnitario ?? 0)
    };
  }

  private toUpdatePayload(raw: ReturnType<typeof this.form.getRawValue>): ActualizarFotoRequestDto {
    return {
      nombreArchivo: this.text(raw.nombreArchivo),
      previewUrl: this.nullableText(raw.previewUrl),
      marcaAguaStorageKey: this.nullableText(raw.marcaAguaStorageKey),
      precioUnitario: Number(raw.precioUnitario ?? 0),
      activa: raw.activa !== false
    };
  }

  private text(value: string | null | undefined): string {
    return value?.trim() ?? '';
  }

  private nullableText(value: string | null | undefined): string | null {
    const text = value?.trim() ?? '';
    return text || null;
  }

  private numberOrNull(value: number | string | null | undefined): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    return Number(value);
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'No se pudo guardar la foto.';
  }
}
