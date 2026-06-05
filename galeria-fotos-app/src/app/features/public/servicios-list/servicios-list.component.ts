import { CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

import { ServicioFotografia } from '../../../core/models/servicio.models';
import { SitioContacto } from '../../../core/models/sitio-publico.models';
import { ServiciosService } from '../../../core/services/servicios.service';
import { SeoService } from '../../../core/services/seo.service';
import { SitioPublicoService } from '../../../core/services/sitio-publico.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-servicios-list',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, EmptyStateComponent, ErrorAlertComponent, LoadingComponent],
  templateUrl: './servicios-list.component.html',
  styleUrl: './servicios-list.component.css',
})
export class ServiciosListComponent implements OnInit {
  private readonly serviciosService = inject(ServiciosService);
  private readonly sitioService = inject(SitioPublicoService);
  private readonly seo = inject(SeoService);
  private readonly cdr = inject(ChangeDetectorRef);

  servicios: ServicioFotografia[] = [];
  contacto: SitioContacto | null = null;
  loading = false;
  error = '';

  ngOnInit(): void {
    this.seo.setPublicPage({
      title: 'Servicios fotograficos',
      description:
        'Servicios de fotografia profesional para eventos, sesiones privadas y propuestas personalizadas.',
      image: '/assets/caterserv/img/event-3.jpg',
    });
    this.loading = true;

    forkJoin({
      servicios: this.serviciosService.getPublicos(),
      contacto: this.sitioService.getContacto(),
    })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: ({ servicios, contacto }) => {
          this.servicios = [...servicios].sort(
            (a, b) => Number(a.orden ?? 0) - Number(b.orden ?? 0),
          );
          this.contacto = contacto;
        },
        error: (error: unknown) => {
          this.error =
            error instanceof Error ? error.message : 'No se pudieron cargar los servicios.';
        },
      });
  }

  get whatsAppUrl(): string {
    return this.contacto?.whatsAppUrl || this.contacto?.perfil?.whatsAppUrl || '';
  }

  trackById(index: number, item: ServicioFotografia): string {
    return item.id ?? String(index);
  }
}
