import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, finalize, forkJoin, of } from 'rxjs';

import { CrearLinkDescargaResponse } from '../../../core/models/descarga.models';
import { Pedido, PedidoEstadoHistorial } from '../../../core/models/pedido.models';
import { DescargasService } from '../../../core/services/descargas.service';
import { PedidosService } from '../../../core/services/pedidos.service';
import { SessionService } from '../../../core/services/session.service';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { NotasInternasComponent } from '../../../shared/components/notas-internas/notas-internas.component';

@Component({
  selector: 'app-pedido-detail',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    NgClass,
    RouterLink,
    ReactiveFormsModule,
    ErrorAlertComponent,
    LoadingComponent,
    NotasInternasComponent,
  ],
  templateUrl: './pedido-detail.component.html',
})
export class PedidoDetailComponent implements OnInit {
  private readonly pedidosService = inject(PedidosService);
  private readonly descargasService = inject(DescargasService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly session = inject(SessionService);

  readonly estadosPedido = [
    'Pendiente',
    'PendientePago',
    'Pagado',
    'PreparandoDescarga',
    'ListoParaDescargar',
    'Cancelado',
    'Reembolsado',
  ];
  pedido: Pedido | null = null;
  historialEstados: PedidoEstadoHistorial[] = [];
  linksByItem: Record<string, CrearLinkDescargaResponse> = {};
  generatingItemId = '';
  loading = false;
  savingEstado = false;
  error = '';
  downloadError = '';
  estadoError = '';
  estadoSuccess = '';

  readonly estadoForm = this.fb.nonNullable.group({
    estado: ['Pendiente', Validators.required],
    comentario: ['', Validators.maxLength(1000)],
  });

  ngOnInit(): void {
    this.load();
  }

  get isAdminRoute(): boolean {
    const url = this.router.url.split('?')[0];
    return url === '/admin' || url.startsWith('/admin/');
  }

  pedidosPath(): string {
    return this.isAdminRoute ? '/admin/pedidos' : '/pedidos';
  }

  descargasPath(): string {
    return this.isAdminRoute ? '/admin/descargas' : '/descargas';
  }

  load(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'Pedido no encontrado.';
      return;
    }

    this.loading = true;
    this.error = '';

    forkJoin({
      pedido: this.pedidosService.get(id),
      historial: this.pedidosService.getHistorialEstados(id).pipe(catchError(() => of([]))),
    })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: ({ pedido, historial }) => {
          this.pedido = pedido;
          this.historialEstados = historial;
          this.estadoForm.patchValue({
            estado: pedido.estado || 'Pendiente',
            comentario: '',
          });
        },
        error: (error: unknown) => {
          this.error = error instanceof Error ? error.message : 'No se pudo cargar el pedido.';
        },
      });
  }

  cambiarEstado(): void {
    if (!this.pedido?.id || !this.session.isAdmin) {
      this.estadoError = 'No tenes permisos para cambiar el estado del pedido.';
      return;
    }

    if (this.estadoForm.invalid) {
      this.estadoForm.markAllAsTouched();
      return;
    }

    const raw = this.estadoForm.getRawValue();
    this.savingEstado = true;
    this.estadoError = '';
    this.estadoSuccess = '';

    this.pedidosService
      .cambiarEstadoPedido(this.pedido.id, {
        estado: raw.estado,
        comentario: raw.comentario.trim() || null,
      })
      .pipe(
        finalize(() => {
          this.savingEstado = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.estadoSuccess = 'Estado del pedido actualizado.';
          this.load();
        },
        error: (error: unknown) => {
          this.estadoError =
            error instanceof Error ? error.message : 'No se pudo cambiar el estado del pedido.';
        },
      });
  }

  generarLinkFoto(fotoId: string): void {
    if (!this.pedido) {
      return;
    }

    this.generateLink(`foto:${fotoId}`, { pedidoId: this.pedido.id, fotoId });
  }

  generarLinkFotoPrivada(fotoPrivadaId: string): void {
    if (!this.pedido) {
      return;
    }

    this.generateLink(`fotoPrivada:${fotoPrivadaId}`, { pedidoId: this.pedido.id, fotoPrivadaId });
  }

  expira(link: CrearLinkDescargaResponse): string | undefined {
    return link.expiraEnUtc ?? link.expiresAtUtc;
  }

  linkId(link: CrearLinkDescargaResponse): string | undefined {
    return link.descargaId ?? link.id;
  }

  estadoClass(estado?: string | null): string {
    const normalized = (estado ?? '').toLowerCase();
    if (normalized.includes('pagado') || normalized.includes('listo')) {
      return 'bg-success';
    }
    if (normalized.includes('cancel') || normalized.includes('reembol')) {
      return 'bg-danger';
    }
    if (normalized.includes('prepar')) {
      return 'bg-info text-dark';
    }
    return 'bg-warning text-dark';
  }

  trackByEstado(index: number, item: PedidoEstadoHistorial): string {
    return (
      item.id ?? `${item.estadoNuevo}-${item.fechaCambioUtc ?? item.fechaCreacionUtc}-${index}`
    );
  }

  private generateLink(
    key: string,
    payload: { pedidoId: string; fotoId?: string; fotoPrivadaId?: string },
  ): void {
    this.generatingItemId = key;
    this.downloadError = '';

    this.descargasService.createLink(payload).subscribe({
      next: (link) => {
        this.linksByItem = { ...this.linksByItem, [key]: link };
        this.generatingItemId = '';
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.downloadError = this.downloadMessage(error);
        this.generatingItemId = '';
        this.cdr.markForCheck();
      },
    });
  }

  private downloadMessage(error: unknown): string {
    const message = error instanceof Error ? error.message : '';
    const normalized = message.toLowerCase();

    if (normalized.includes('pagado')) {
      return 'El pedido todavia no esta pagado. Completa el pago antes de generar descargas.';
    }

    if (
      normalized.includes('limite') ||
      normalized.includes('limit') ||
      normalized.includes('max')
    ) {
      return 'Se alcanzo el limite de descargas permitido.';
    }

    if (normalized.includes('venc') || normalized.includes('expir')) {
      return 'El link esta vencido. Regenera un nuevo link desde la seccion Descargas.';
    }

    if (
      normalized.includes('permiso') ||
      normalized.includes('forbidden') ||
      normalized.includes('403')
    ) {
      return 'No tenes permisos para generar esta descarga.';
    }

    if (normalized.includes('comprada') || normalized.includes('compra')) {
      return 'La foto no pertenece a este pedido o no fue comprada.';
    }

    if (normalized.includes('privada') || normalized.includes('ajena')) {
      return 'La foto privada no pertenece a tu cuenta.';
    }

    return message || 'No se pudo generar el link de descarga.';
  }
}
