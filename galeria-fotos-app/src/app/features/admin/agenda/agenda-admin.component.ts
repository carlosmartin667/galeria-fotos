import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { AgendaItem, CrearAgendaItemRequest } from '../../../core/models/agenda.models';
import { AgendaService } from '../../../core/services/agenda.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

type AgendaControl = 'titulo' | 'tipo' | 'fechaInicio' | 'fechaFin' | 'estado';

@Component({
  selector: 'app-agenda-admin',
  standalone: true,
  imports: [DatePipe, NgClass, NgFor, NgIf, ReactiveFormsModule, EmptyStateComponent, ErrorAlertComponent, LoadingComponent],
  templateUrl: './agenda-admin.component.html',
  styleUrl: './agenda-admin.component.css'
})
export class AgendaAdminComponent implements OnInit {
  private readonly agendaService = inject(AgendaService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly tipos = ['Evento', 'SesionPrivada', 'Reunion', 'Bloqueo', 'Presupuesto', 'Otro'];
  readonly estados = ['Programado', 'Confirmado', 'Cancelado', 'Finalizado'];
  items: AgendaItem[] = [];
  editingId = '';
  loading = false;
  saving = false;
  submitted = false;
  error = '';
  success = '';

  readonly filterForm = this.fb.nonNullable.group({
    desde: [''],
    hasta: [''],
    tipo: [''],
    estado: [''],
    activo: ['all']
  });

  readonly form = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(180)]],
    descripcion: ['', Validators.maxLength(1000)],
    tipo: ['Evento', [Validators.required, Validators.maxLength(64)]],
    fechaInicio: ['', Validators.required],
    fechaFin: ['', Validators.required],
    ubicacion: ['', Validators.maxLength(240)],
    estado: ['Programado', Validators.maxLength(64)],
    eventoId: [''],
    sesionPrivadaId: [''],
    clienteId: [''],
    solicitudPresupuestoId: [''],
    activo: [true]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    const filters = this.filterForm.getRawValue();
    this.agendaService.getAgenda({
      desde: this.toFilterIso(filters.desde, false),
      hasta: this.toFilterIso(filters.hasta, true),
      tipo: filters.tipo || null,
      estado: filters.estado || null,
      activo: this.activoParam(filters.activo)
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (items) => {
        this.items = [...items].sort((a, b) => new Date(a.fechaInicioUtc).getTime() - new Date(b.fechaInicioUtc).getTime());
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo cargar la agenda.';
      }
    });
  }

  edit(item: AgendaItem): void {
    this.editingId = item.id ?? '';
    this.submitted = false;
    this.error = '';
    this.success = '';
    this.form.patchValue({
      titulo: item.titulo,
      descripcion: item.descripcion ?? '',
      tipo: item.tipo || 'Evento',
      fechaInicio: this.toInputDateTime(item.fechaInicioUtc),
      fechaFin: this.toInputDateTime(item.fechaFinUtc),
      ubicacion: item.ubicacion ?? '',
      estado: item.estado ?? 'Programado',
      eventoId: item.eventoId ?? '',
      sesionPrivadaId: item.sesionPrivadaId ?? '',
      clienteId: item.clienteId ?? '',
      solicitudPresupuestoId: item.solicitudPresupuestoId ?? '',
      activo: item.activo !== false
    });
  }

  cancel(): void {
    this.editingId = '';
    this.submitted = false;
    this.form.reset({
      titulo: '',
      descripcion: '',
      tipo: 'Evento',
      fechaInicio: '',
      fechaFin: '',
      ubicacion: '',
      estado: 'Programado',
      eventoId: '',
      sesionPrivadaId: '',
      clienteId: '',
      solicitudPresupuestoId: '',
      activo: true
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

    if (!this.datesAreValid()) {
      this.error = 'La fecha de fin debe ser mayor a la fecha de inicio.';
      return;
    }

    const payload = this.toPayload();
    const request = this.editingId
      ? this.agendaService.actualizarAgendaItem(this.editingId, payload)
      : this.agendaService.crearAgendaItem(payload);

    this.saving = true;
    request.pipe(
      finalize(() => {
        this.saving = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.success = this.editingId ? 'Item de agenda actualizado.' : 'Item de agenda creado.';
        this.cancel();
        this.load();
      },
      error: (error: unknown) => {
        this.error = this.toAgendaError(error);
      }
    });
  }

  desactivar(item: AgendaItem): void {
    if (!item.id || !confirm(`Eliminar o desactivar "${item.titulo}"?`)) {
      return;
    }

    this.agendaService.eliminarAgendaItem(item.id).subscribe({
      next: () => {
        this.success = 'Item eliminado o desactivado.';
        this.load();
      },
      error: (error: unknown) => {
        this.error = this.toAgendaError(error);
        this.cdr.markForCheck();
      }
    });
  }

  clearFilters(): void {
    this.filterForm.reset({
      desde: '',
      hasta: '',
      tipo: '',
      estado: '',
      activo: 'all'
    });
    this.load();
  }

  tipoClass(tipo?: string | null): string {
    const normalized = (tipo ?? '').toLowerCase();
    if (normalized.includes('bloqueo')) {
      return 'bg-danger';
    }
    if (normalized.includes('reunion') || normalized.includes('presupuesto')) {
      return 'bg-info text-dark';
    }
    if (normalized.includes('sesion')) {
      return 'bg-primary';
    }
    return 'bg-warning text-dark';
  }

  estadoClass(estado?: string | null): string {
    const normalized = (estado ?? 'Programado').toLowerCase();
    if (normalized.includes('confirm')) {
      return 'bg-success';
    }
    if (normalized.includes('cancel')) {
      return 'bg-danger';
    }
    if (normalized.includes('final')) {
      return 'bg-secondary';
    }
    return 'bg-warning text-dark';
  }

  showError(controlName: AgendaControl): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted);
  }

  trackById(index: number, item: AgendaItem): string {
    return item.id ?? String(index);
  }

  private toPayload(): CrearAgendaItemRequest {
    const raw = this.form.getRawValue();
    return {
      titulo: this.trim(raw.titulo),
      descripcion: this.optional(raw.descripcion),
      tipo: this.trim(raw.tipo),
      fechaInicioUtc: this.toIso(raw.fechaInicio),
      fechaFinUtc: this.toIso(raw.fechaFin),
      ubicacion: this.optional(raw.ubicacion),
      estado: this.optional(raw.estado),
      eventoId: this.optional(raw.eventoId),
      sesionPrivadaId: this.optional(raw.sesionPrivadaId),
      clienteId: this.optional(raw.clienteId),
      solicitudPresupuestoId: this.optional(raw.solicitudPresupuestoId),
      activo: raw.activo === true
    };
  }

  private datesAreValid(): boolean {
    const raw = this.form.getRawValue();
    const inicio = new Date(raw.fechaInicio ?? '').getTime();
    const fin = new Date(raw.fechaFin ?? '').getTime();
    return Number.isFinite(inicio) && Number.isFinite(fin) && fin > inicio;
  }

  private toAgendaError(error: unknown): string {
    const message = error instanceof Error ? error.message : 'No se pudo guardar la agenda.';
    return message.toLowerCase().includes('solap')
      ? 'No se pudo guardar: la agenda se solapa con otra fecha ocupada.'
      : message;
  }

  private activoParam(value: string): boolean | null {
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
    return null;
  }

  private toFilterIso(value: string, endOfDay: boolean): string | null {
    if (!value) {
      return null;
    }

    const suffix = endOfDay ? 'T23:59:59' : 'T00:00:00';
    const date = new Date(`${value}${suffix}`);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  private toIso(value: string | null | undefined): string {
    const date = new Date(value ?? '');
    return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  }

  private toInputDateTime(value?: string | null): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private trim(value: string | null | undefined): string {
    return (value ?? '').trim();
  }

  private optional(value: string | null | undefined): string | null {
    const trimmed = this.trim(value);
    return trimmed || null;
  }
}
