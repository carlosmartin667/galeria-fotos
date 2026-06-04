import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

import { PortfolioItem } from '../../../core/models/portfolio.models';
import { SitioContacto } from '../../../core/models/sitio-publico.models';
import { PortfolioService } from '../../../core/services/portfolio.service';
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
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  item: PortfolioItem | null = null;
  contacto: SitioContacto | null = null;
  loading = false;
  error = '';

  ngOnInit(): void {
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
