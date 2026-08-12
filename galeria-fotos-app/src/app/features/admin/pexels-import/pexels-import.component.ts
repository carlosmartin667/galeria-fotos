import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Evento } from '../../../core/models/evento.models';
import {
  ImportarFotosPexelsRequest,
  ImportarFotosPexelsResponse,
} from '../../../core/models/pexels.models';
import { AdminService } from '../../../core/services/admin.service';
import { EventosService } from '../../../core/services/eventos.service';
import { technicalReference } from '../../../core/utils/sensitive-text';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-pexels-import',
  standalone: true,
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    RouterLink,
    EmptyStateComponent,
    ErrorAlertComponent,
    LoadingComponent,
  ],
  templateUrl: './pexels-import.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './pexels-import.component.css',
})
export class PexelsImportComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly eventosService = inject(EventosService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  eventos: Evento[] = [];
  loadingEventos = false;
  importing = false;
  submitted = false;
  error = '';
  success = '';
  result: ImportarFotosPexelsResponse | null = null;

  readonly form = this.fb.nonNullable.group({
    eventoId: ['', Validators.required],
    query: ['', [Validators.required, Validators.maxLength(120)]],
    cantidad: [30, [Validators.required, Validators.min(1), Validators.max(200)]],
    precioUnitario: [1500, [Validators.required, Validators.min(0)]],
  });

  get selectedEventoId(): string {
    return this.result?.eventoId || this.form.controls.eventoId.getRawValue();
  }

  get fotosImportadas() {
    return this.result?.fotos ?? [];
  }

  ngOnInit(): void {
    const eventoId = this.route.snapshot.queryParamMap.get('eventoId');

    if (eventoId) {
      this.form.patchValue({ eventoId });
    }

    this.loadEventos();
  }

  loadEventos(): void {
    this.loadingEventos = true;
    this.error = '';

    this.eventosService
      .list()
      .pipe(
        finalize(() => {
          this.loadingEventos = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (eventos) => {
          this.eventos = eventos;
        },
        error: (error: unknown) => {
          this.error = this.message(error);
        },
      });
  }

  submit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';
    this.result = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request: ImportarFotosPexelsRequest = {
      eventoId: this.form.value.eventoId?.trim() ?? '',
      query: this.form.value.query?.trim() ?? '',
      cantidad: Number(this.form.value.cantidad),
      precioUnitario: Number(this.form.value.precioUnitario),
    };

    if (!this.isValidRequest(request)) {
      this.error =
        'Revisa los datos: evento y tematica son requeridos, cantidad debe estar entre 1 y 200 y precio unitario debe ser mayor o igual a 0.';
      this.form.markAllAsTouched();
      return;
    }

    this.importing = true;

    this.adminService.importarFotosPexels(request).subscribe({
      next: (result) => {
        this.result = {
          ...result,
          eventoId: result.eventoId || request.eventoId,
          query: result.query || request.query,
          cantidadSolicitada: result.cantidadSolicitada ?? request.cantidad,
        };
        this.success = 'Importacion finalizada.';
        this.importing = false;
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.error = this.message(error);
        this.importing = false;
        this.cdr.markForCheck();
      },
    });
  }

  reset(): void {
    this.submitted = false;
    this.error = '';
    this.success = '';
    this.result = null;
    this.form.reset({
      eventoId: '',
      query: '',
      cantidad: 30,
      precioUnitario: 1500,
    });
  }

  showError(controlName: 'eventoId' | 'query' | 'cantidad' | 'precioUnitario'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted);
  }

  trackEvento(_: number, evento: Evento): string {
    return evento.id;
  }

  trackFoto(index: number): string {
    const foto = this.fotosImportadas[index];
    return foto?.fotoId || foto?.nombreArchivo || String(index);
  }

  technicalValue(value: unknown): string {
    return technicalReference(value);
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'No se pudo importar fotos desde Pexels.';
  }

  private isValidRequest(request: ImportarFotosPexelsRequest): boolean {
    return (
      Boolean(request.eventoId) &&
      Boolean(request.query) &&
      Number.isFinite(request.cantidad) &&
      request.cantidad >= 1 &&
      request.cantidad <= 200 &&
      Number.isFinite(request.precioUnitario) &&
      request.precioUnitario >= 0
    );
  }
}
