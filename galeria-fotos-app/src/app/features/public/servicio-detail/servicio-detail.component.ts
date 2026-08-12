import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

import { ServicioFotografia } from '../../../core/models/servicio.models';
import { SitioContacto } from '../../../core/models/sitio-publico.models';
import { ServiciosService } from '../../../core/services/servicios.service';
import { SeoService } from '../../../core/services/seo.service';
import { SitioPublicoService } from '../../../core/services/sitio-publico.service';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-servicio-detail',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, ErrorAlertComponent, LoadingComponent],
  templateUrl: './servicio-detail.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './servicio-detail.component.css',
})
export class ServicioDetailComponent implements OnInit {
  private readonly serviciosService = inject(ServiciosService);
  private readonly sitioService = inject(SitioPublicoService);
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  servicio: ServicioFotografia | null = null;
  contacto: SitioContacto | null = null;
  loading = false;
  error = '';

  ngOnInit(): void {
    this.seo.setPublicPage({
      title: 'Detalle de servicio fotografico',
      description: 'Informacion de un servicio fotografico disponible en GaleriaFotos.',
      type: 'article',
      image: '/assets/caterserv/img/event-4.jpg',
    });
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'Servicio no encontrado.';
      return;
    }

    this.loading = true;
    forkJoin({
      servicio: this.serviciosService.getById(id),
      contacto: this.sitioService.getContacto(),
    })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: ({ servicio, contacto }) => {
          this.servicio = servicio;
          this.contacto = contacto;
          this.seo.setPublicPage({
            title: servicio.nombre || 'Servicio fotografico',
            description:
              servicio.descripcion ||
              'Servicio fotografico profesional disponible para presupuestar.',
            type: 'article',
            image: servicio.imagenUrl,
          });
        },
        error: (error: unknown) => {
          this.error = error instanceof Error ? error.message : 'No se pudo cargar el servicio.';
        },
      });
  }

  get whatsAppUrl(): string {
    return this.contacto?.whatsAppUrl || this.contacto?.perfil?.whatsAppUrl || '';
  }
}
