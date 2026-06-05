import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

import { PortfolioItem } from '../../../core/models/portfolio.models';
import { SitioContacto } from '../../../core/models/sitio-publico.models';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { SeoService } from '../../../core/services/seo.service';
import { SitioPublicoService } from '../../../core/services/sitio-publico.service';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-portfolio-detail',
  standalone: true,
  imports: [NgIf, RouterLink, ErrorAlertComponent, LoadingComponent],
  templateUrl: './portfolio-detail.component.html',
  styleUrl: './portfolio-detail.component.css'
})
export class PortfolioDetailComponent implements OnInit {
  private readonly portfolioService = inject(PortfolioService);
  private readonly sitioService = inject(SitioPublicoService);
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  item: PortfolioItem | null = null;
  contacto: SitioContacto | null = null;
  loading = false;
  error = '';

  ngOnInit(): void {
    this.seo.setPublicPage({
      title: 'Detalle de portfolio',
      description: 'Detalle de un trabajo fotografico publicado en GaleriaFotos.',
      type: 'article',
      image: '/assets/caterserv/img/event-2.jpg'
    });
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'Trabajo no encontrado.';
      return;
    }

    this.loading = true;
    forkJoin({
      item: this.portfolioService.getById(id),
      contacto: this.sitioService.getContacto()
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: ({ item, contacto }) => {
        this.item = item;
        this.contacto = contacto;
        this.seo.setPublicPage({
          title: item.titulo || 'Detalle de portfolio',
          description: item.descripcion || item.categoria || 'Trabajo fotografico publicado en GaleriaFotos.',
          type: 'article',
          image: item.imagenUrl
        });
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo cargar el detalle.';
      }
    });
  }

  get whatsAppUrl(): string {
    return this.contacto?.whatsAppUrl || this.contacto?.perfil?.whatsAppUrl || '';
  }
}
