import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ActualizarFotoRequest, CrearFotoMetadataRequest } from '../../../core/models/foto.models';
import { FotosService } from '../../../core/services/fotos.service';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

type FotoFormValue = {
  eventoId: string;
  nombreArchivo: string;
  contentType: string;
  storageKey: string;
  previewUrl: string;
  marcaAguaStorageKey: string;
  sizeInBytes: number;
  width: number;
  height: number;
  precioUnitario: number;
  activa: boolean;
  tieneMarcaAgua: boolean;
  procesada: boolean;
};

@Component({
  selector: 'app-foto-form',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterLink, ErrorAlertComponent, LoadingComponent],
  templateUrl: './foto-form.component.html'
})
export class FotoFormComponent implements OnInit {
  private readonly fotosService = inject(FotosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  id: string | null = null;
  loading = false;
  saving = false;
  generatingKey = false;
  submitted = false;
  showStorageKey = false;
  showMarcaAguaKey = false;
  error = '';

  readonly form = this.fb.nonNullable.group({
    eventoId: ['', Validators.required],
    nombreArchivo: ['', [Validators.required, Validators.maxLength(260)]],
    contentType: ['image/jpeg', [Validators.required, Validators.maxLength(120)]],
    storageKey: ['', [Validators.required, Validators.maxLength(700)]],
    previewUrl: ['', Validators.maxLength(1000)],
    marcaAguaStorageKey: ['', Validators.maxLength(700)],
    sizeInBytes: [0],
    width: [0],
    height: [0],
    precioUnitario: [0, Validators.required],
    activa: [true],
    tieneMarcaAgua: [false],
    procesada: [false]
  });

  get isEdit(): boolean {
    return Boolean(this.id);
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    const eventoId = this.route.snapshot.queryParamMap.get('eventoId');

    if (eventoId) {
      this.form.patchValue({ eventoId });
    }

    if (!this.id) {
      return;
    }

    this.form.controls.eventoId.disable();
    this.form.controls.contentType.disable();
    this.form.controls.storageKey.disable();
    this.loading = true;

    this.fotosService.get(this.id).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (foto) => {
        this.form.patchValue({
          eventoId: foto.eventoId,
          nombreArchivo: foto.nombreArchivo,
          contentType: foto.contentType ?? '',
          storageKey: foto.storageKey ?? '',
          previewUrl: foto.previewUrl ?? '',
          marcaAguaStorageKey: foto.marcaAguaStorageKey ?? '',
          sizeInBytes: foto.sizeInBytes ?? 0,
          width: foto.width ?? 0,
          height: foto.height ?? 0,
          precioUnitario: foto.precioUnitario ?? 0,
          activa: foto.activa !== false,
          tieneMarcaAgua: foto.tieneMarcaAgua === true,
          procesada: foto.procesada === true
        });
      },
      error: (error: unknown) => {
        this.error = this.message(error);
      }
    });
  }

  generateStorageKey(): void {
    const eventoId = this.form.controls.eventoId.getRawValue().trim();
    const nombreArchivo = this.form.controls.nombreArchivo.getRawValue().trim();

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
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.error = this.message(error);
        this.generatingKey = false;
        this.cdr.markForCheck();
      }
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
    const request = this.id
      ? this.fotosService.update(this.id, this.toUpdatePayload(raw))
      : this.fotosService.createMetadata(this.toCreatePayload(raw));

    this.saving = true;
    request.subscribe({
      next: (foto) => void this.router.navigate(['/fotos/evento', foto.eventoId || raw.eventoId]),
      error: (error: unknown) => {
        this.error = this.message(error);
        this.saving = false;
        this.cdr.markForCheck();
      }
    });
  }

  showError(controlName: 'eventoId' | 'nombreArchivo' | 'contentType' | 'storageKey' | 'precioUnitario'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted);
  }

  toggleStorageKey(): void {
    this.showStorageKey = !this.showStorageKey;
  }

  toggleMarcaAguaKey(): void {
    this.showMarcaAguaKey = !this.showMarcaAguaKey;
  }

  private toCreatePayload(raw: FotoFormValue): CrearFotoMetadataRequest {
    return {
      eventoId: raw.eventoId.trim(),
      nombreArchivo: raw.nombreArchivo.trim(),
      contentType: raw.contentType.trim(),
      storageKey: raw.storageKey.trim(),
      previewUrl: raw.previewUrl.trim() || undefined,
      marcaAguaStorageKey: raw.marcaAguaStorageKey.trim() || undefined,
      sizeInBytes: Number(raw.sizeInBytes),
      width: raw.width ? Number(raw.width) : undefined,
      height: raw.height ? Number(raw.height) : undefined,
      precioUnitario: Number(raw.precioUnitario),
      tieneMarcaAgua: raw.tieneMarcaAgua,
      procesada: raw.procesada
    };
  }

  private toUpdatePayload(raw: FotoFormValue): ActualizarFotoRequest {
    return {
      nombreArchivo: raw.nombreArchivo.trim(),
      previewUrl: raw.previewUrl.trim() || undefined,
      marcaAguaStorageKey: raw.marcaAguaStorageKey.trim() || undefined,
      precioUnitario: Number(raw.precioUnitario),
      activa: raw.activa,
      tieneMarcaAgua: raw.tieneMarcaAgua,
      procesada: raw.procesada
    };
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'No se pudo guardar la foto.';
  }
}
