import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import {
  Carrito,
  CarritoItem,
  CrearPedidoDesdeCarritoResponse,
} from '../../core/models/carrito.models';
import { CarritoService } from '../../core/services/carrito.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [
    CurrencyPipe,
    RouterLink,
    ReactiveFormsModule,
    EmptyStateComponent,
    ErrorAlertComponent,
    LoadingComponent,
  ],
  templateUrl: './carrito.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './carrito.component.css',
})
export class CarritoComponent implements OnInit {
  private readonly carritoService = inject(CarritoService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  carrito: Carrito | null = null;
  pedidoCreado: CrearPedidoDesdeCarritoResponse | null = null;
  loading = false;
  applying = false;
  removingCoupon = false;
  creatingOrder = false;
  actionItemId = '';
  submittedCoupon = false;
  error = '';
  couponError = '';
  success = '';

  readonly couponForm = this.fb.nonNullable.group({
    codigo: ['', [Validators.required, Validators.maxLength(64)]],
  });

  ngOnInit(): void {
    this.load();
  }

  get items(): CarritoItem[] {
    return this.carrito?.items ?? [];
  }

  get moneda(): string {
    return this.carrito?.moneda || this.items.find((item) => item.moneda)?.moneda || 'USD';
  }

  get pedidoId(): string {
    return (
      this.pedidoCreado?.pedido?.id || this.pedidoCreado?.pedidoId || this.pedidoCreado?.id || ''
    );
  }

  load(clearMessages = true): void {
    this.loading = true;
    this.error = '';
    this.couponError = '';
    if (clearMessages) {
      this.success = '';
    }

    this.carritoService
      .getCarrito()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (carrito) => {
          this.carrito = carrito;
        },
        error: (error: unknown) => {
          this.error = error instanceof Error ? error.message : 'No se pudo cargar el carrito.';
        },
      });
  }

  aplicarCupon(): void {
    this.submittedCoupon = true;
    this.couponError = '';
    this.success = '';

    if (this.couponForm.invalid) {
      this.couponForm.markAllAsTouched();
      return;
    }

    this.applying = true;
    this.carritoService
      .aplicarCupon(this.couponForm.controls.codigo.value.trim())
      .pipe(
        finalize(() => {
          this.applying = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (carrito) => {
          this.carrito = carrito;
          this.success = 'Cupon aplicado.';
        },
        error: (error: unknown) => {
          this.couponError = this.couponMessage(error);
        },
      });
  }

  quitarCupon(): void {
    this.removingCoupon = true;
    this.couponError = '';
    this.success = '';
    this.carritoService
      .quitarCupon()
      .pipe(
        finalize(() => {
          this.removingCoupon = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (carrito) => {
          this.carrito = carrito;
          this.couponForm.reset({ codigo: '' });
          this.success = 'Cupon quitado.';
        },
        error: (error: unknown) => {
          this.couponError = error instanceof Error ? error.message : 'No se pudo quitar el cupon.';
        },
      });
  }

  quitarItem(item: CarritoItem): void {
    const id = item.id || item.itemId || '';
    if (!id || !confirm('Quitar este item del carrito?')) {
      return;
    }

    this.actionItemId = id;
    this.error = '';
    this.carritoService
      .quitarItem(id)
      .pipe(
        finalize(() => {
          this.actionItemId = '';
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (carrito) => {
          this.carrito = carrito;
        },
        error: (error: unknown) => {
          this.error = error instanceof Error ? error.message : 'No se pudo quitar el item.';
        },
      });
  }

  crearPedido(): void {
    this.creatingOrder = true;
    this.error = '';
    this.success = '';
    this.pedidoCreado = null;

    this.carritoService
      .crearPedido()
      .pipe(
        finalize(() => {
          this.creatingOrder = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response) => {
          this.pedidoCreado = response;
          this.success = response.mensaje || 'Pedido creado desde el carrito.';
          this.load(false);
        },
        error: (error: unknown) => {
          this.error =
            error instanceof Error ? error.message : 'No se pudo crear el pedido desde el carrito.';
        },
      });
  }

  totalItem(item: CarritoItem): number {
    return Number(item.totalFinal ?? item.total ?? item.subtotal ?? item.precioUnitario ?? 0);
  }

  trackById(index: number, item: CarritoItem): string {
    return item.id ?? item.itemId ?? String(index);
  }

  private couponMessage(error: unknown): string {
    const message = error instanceof Error ? error.message : '';
    const normalized = message.toLowerCase();

    if (normalized.includes('venc')) {
      return 'El cupon esta vencido.';
    }
    if (normalized.includes('activo') || normalized.includes('inactivo')) {
      return 'El cupon no esta activo.';
    }
    if (normalized.includes('min')) {
      return 'El carrito no cumple el minimo requerido para este cupon.';
    }
    if (normalized.includes('usado') || normalized.includes('uso')) {
      return 'El cupon ya fue usado o alcanzo su limite.';
    }
    if (
      normalized.includes('invalid') ||
      normalized.includes('invalido') ||
      normalized.includes('no existe')
    ) {
      return 'El cupon no es valido.';
    }
    return message || 'No se pudo aplicar el cupon.';
  }
}
