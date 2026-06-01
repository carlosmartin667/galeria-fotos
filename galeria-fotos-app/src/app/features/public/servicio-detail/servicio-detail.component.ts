import { CurrencyPipe, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

import { ServicioFotografia } from '../../../core/models/servicio.models';
import { SitioContacto } from '../../../core/models/sitio-publico.models';
import { ServiciosService } from '../../../core/services/servicios.service';
import { SitioPublicoService } from '../../../core/services/sitio-publico.service';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-servicio-detail',
  standalone: true,
  imports: [CurrencyPipe, NgIf, RouterLink, ErrorAlertComponent, LoadingComponent],
  templateUrl: './servicio-detail.component.html',
  styleUrl: './servicio-detail.component.css'
})
export class ServicioDetailComponent implements OnInit {
  private readonly serviciosService = inject(ServiciosService);
  private readonly sitioService = inject(SitioPublicoService);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  servicio: ServicioFotografia | null = null;
  contacto: SitioContacto | null = null;
  loading = false;
  error = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'Servicio no encontrado.';
      return;
    }

    this.loading = true;
    forkJoin({
      servicio: this.serviciosService.getById(id),
      contacto: this.sitioService.getContacto()
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: ({ servicio, contacto }) => {
        this.servicio = servicio;
        this.contacto = contacto;
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo cargar el servicio.';
      }
    });
  }

  get whatsAppUrl(): string {
    return this.contacto?.whatsAppUrl || this.contacto?.perfil?.whatsAppUrl || '';
  }
}
