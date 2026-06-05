import { DatePipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { NotaInterna } from '../../../core/models/nota-interna.models';
import { NotasInternasService } from '../../../core/services/notas-internas.service';
import { SessionService } from '../../../core/services/session.service';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { ErrorAlertComponent } from '../error-alert/error-alert.component';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-notas-internas',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    EmptyStateComponent,
    ErrorAlertComponent,
    LoadingComponent,
  ],
  templateUrl: './notas-internas.component.html',
  styleUrl: './notas-internas.component.css',
})
export class NotasInternasComponent implements OnChanges {
  private readonly notasService = inject(NotasInternasService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly session = inject(SessionService);

  @Input() entidadTipo = '';
  @Input() entidadId = '';

  notas: NotaInterna[] = [];
  editingId = '';
  loading = false;
  saving = false;
  submitted = false;
  error = '';
  success = '';

  readonly form = this.fb.nonNullable.group({
    texto: ['', [Validators.required, Validators.maxLength(2000)]],
    activa: [true],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['entidadTipo'] || changes['entidadId']) && this.canLoad()) {
      this.load();
    }
  }

  load(): void {
    if (!this.canLoad()) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.notasService
      .getNotas(this.entidadTipo, this.entidadId)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (notas) => {
          this.notas = notas;
        },
        error: (error: unknown) => {
          this.error =
            error instanceof Error ? error.message : 'No se pudieron cargar las notas internas.';
        },
      });
  }

  edit(nota: NotaInterna): void {
    this.editingId = nota.id ?? '';
    this.submitted = false;
    this.form.patchValue({
      texto: nota.texto,
      activa: nota.activa !== false,
    });
  }

  cancel(): void {
    this.editingId = '';
    this.submitted = false;
    this.form.reset({
      texto: '',
      activa: true,
    });
  }

  submit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';

    if (!this.canLoad()) {
      this.error = 'Las notas internas son solo para Admin.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const texto = raw.texto.trim();
    const request = this.editingId
      ? this.notasService.actualizarNota(this.editingId, { texto, activa: raw.activa })
      : this.notasService.crearNota(this.entidadTipo, this.entidadId, { texto });

    this.saving = true;
    request
      .pipe(
        finalize(() => {
          this.saving = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.success = this.editingId ? 'Nota actualizada.' : 'Nota creada.';
          this.cancel();
          this.load();
        },
        error: (error: unknown) => {
          this.error =
            error instanceof Error ? error.message : 'No se pudo guardar la nota interna.';
        },
      });
  }

  eliminar(nota: NotaInterna): void {
    if (!nota.id || !confirm('Eliminar o desactivar esta nota interna?')) {
      return;
    }

    this.notasService.eliminarNota(nota.id).subscribe({
      next: () => {
        this.success = 'Nota eliminada o desactivada.';
        this.load();
      },
      error: (error: unknown) => {
        this.error =
          error instanceof Error ? error.message : 'No se pudo eliminar la nota interna.';
        this.cdr.markForCheck();
      },
    });
  }

  autor(nota: NotaInterna): string {
    return nota.autorNombre || nota.usuarioNombre || 'Admin';
  }

  showError(): boolean {
    const control = this.form.controls.texto;
    return control.invalid && (control.touched || this.submitted);
  }

  trackById(index: number, nota: NotaInterna): string {
    return nota.id ?? String(index);
  }

  private canLoad(): boolean {
    return this.session.isAdmin && Boolean(this.entidadTipo && this.entidadId);
  }
}
