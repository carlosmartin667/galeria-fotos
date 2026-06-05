import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { SitioContacto } from '../../../core/models/sitio-publico.models';
import { SeoService } from '../../../core/services/seo.service';
import { SitioPublicoService } from '../../../core/services/sitio-publico.service';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { AgendaDisponibilidadPublicaComponent } from '../disponibilidad/agenda-disponibilidad-publica.component';

@Component({
  selector: 'app-contacto-public',
  standalone: true,
  imports: [
    RouterLink,
    ErrorAlertComponent,
    LoadingComponent,
    AgendaDisponibilidadPublicaComponent,
  ],
  templateUrl: './contacto-public.component.html',
  styleUrl: './contacto-public.component.css',
})
export class ContactoPublicComponent implements OnInit {
  private readonly sitioService = inject(SitioPublicoService);
  private readonly seo = inject(SeoService);
  private readonly cdr = inject(ChangeDetectorRef);

  contacto: SitioContacto | null = null;
  loading = false;
  error = '';

  ngOnInit(): void {
    this.seo.setPublicPage({
      title: 'Contacto',
      description:
        'Contacto de GaleriaFotos para coordinar servicios fotograficos, sesiones y presupuestos.',
      image: '/assets/caterserv/img/background-site.jpg',
    });
    this.loading = true;

    this.sitioService
      .getContacto()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (contacto) => {
          this.contacto = contacto;
          this.seo.setPublicPage({
            title: `Contacto ${this.nombre}`,
            description: this.descripcion,
            image: contacto.perfil?.bannerUrl || contacto.perfil?.fotoPerfilUrl,
          });
        },
        error: (error: unknown) => {
          this.error = error instanceof Error ? error.message : 'No se pudo cargar el contacto.';
        },
      });
  }

  get nombre(): string {
    return this.contacto?.perfil?.nombre || 'GaleriaFotos';
  }

  get descripcion(): string {
    return (
      this.contacto?.textoBienvenida ||
      this.contacto?.perfil?.textoBienvenida ||
      this.contacto?.perfil?.descripcion ||
      'Coordinemos tu sesion o cobertura fotografica.'
    );
  }

  get whatsAppUrl(): string {
    return this.contacto?.whatsAppUrl || this.contacto?.perfil?.whatsAppUrl || '';
  }

  get email(): string {
    return this.contacto?.correoPublico || this.contacto?.perfil?.correoPublico || '';
  }

  get direccion(): string {
    return [
      this.contacto?.direccion || this.contacto?.perfil?.direccion,
      this.contacto?.ciudad || this.contacto?.perfil?.ciudad,
      this.contacto?.provincia || this.contacto?.perfil?.provincia,
      this.contacto?.pais || this.contacto?.perfil?.pais,
    ]
      .filter(Boolean)
      .join(', ');
  }
}
