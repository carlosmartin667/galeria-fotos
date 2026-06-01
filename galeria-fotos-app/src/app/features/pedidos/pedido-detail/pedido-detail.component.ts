import { CurrencyPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { CrearLinkDescargaResponse } from '../../../core/models/descarga.models';
import { Pedido } from '../../../core/models/pedido.models';
import { DescargasService } from '../../../core/services/descargas.service';
import { PedidosService } from '../../../core/services/pedidos.service';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-pedido-detail',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgFor, NgIf, RouterLink, ErrorAlertComponent, LoadingComponent],
  templateUrl: './pedido-detail.component.html'
})
export class PedidoDetailComponent implements OnInit {
  private readonly pedidosService = inject(PedidosService);
  private readonly descargasService = inject(DescargasService);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  pedido: Pedido | null = null;
  linksByItem: Record<string, CrearLinkDescargaResponse> = {};
  generatingItemId = '';
  loading = false;
  error = '';
  downloadError = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'Pedido no encontrado.';
      return;
    }

    this.loading = true;
    this.pedidosService.get(id).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (pedido) => {
        this.pedido = pedido;
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo cargar el pedido.';
      }
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

  private generateLink(key: string, payload: { pedidoId: string; fotoId?: string; fotoPrivadaId?: string }): void {
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
      }
    });
  }

  private downloadMessage(error: unknown): string {
    const message = error instanceof Error ? error.message : '';
    const normalized = message.toLowerCase();

    if (normalized.includes('pagado')) {
      return 'El pedido todavia no esta pagado. Completa el pago antes de generar descargas.';
    }

    if (normalized.includes('limite') || normalized.includes('limit') || normalized.includes('max')) {
      return 'Se alcanzo el limite de descargas permitido.';
    }

    if (normalized.includes('venc') || normalized.includes('expir')) {
      return 'El link esta vencido. Regenera un nuevo link desde la seccion Descargas.';
    }

    if (normalized.includes('permiso') || normalized.includes('forbidden') || normalized.includes('403')) {
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
