import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { PortfolioItem } from '../../../core/models/portfolio.models';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { SeoService } from '../../../core/services/seo.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { ImageLightboxComponent } from '../../../shared/components/image-lightbox/image-lightbox.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-portfolio-list',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    EmptyStateComponent,
    ErrorAlertComponent,
    ImageLightboxComponent,
    LoadingComponent,
  ],
  templateUrl: './portfolio-list.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './portfolio-list.component.css',
})
export class PortfolioListComponent implements OnInit {
  private readonly portfolioService = inject(PortfolioService);
  private readonly seo = inject(SeoService);
  private readonly cdr = inject(ChangeDetectorRef);

  items: PortfolioItem[] = [];
  category = 'Todas';
  lightboxImageUrl = '';
  lightboxTitle = '';
  lightboxOpen = false;
  loading = false;
  error = '';

  ngOnInit(): void {
    this.seo.setPublicPage({
      title: 'Portfolio fotografico',
      description:
        'Trabajos fotograficos destacados, eventos y sesiones publicadas por GaleriaFotos.',
      image: '/assets/caterserv/img/event-1.jpg',
    });
    this.load();
  }

  get categories(): string[] {
    const categories = this.items.map((item) => item.categoria?.trim()).filter(Boolean) as string[];
    return ['Todas', ...Array.from(new Set(categories))];
  }

  get filteredItems(): PortfolioItem[] {
    return this.category === 'Todas'
      ? this.items
      : this.items.filter((item) => item.categoria === this.category);
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.portfolioService
      .getPublicos()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (items) => {
          this.items = [...items].sort((a, b) => Number(a.orden ?? 0) - Number(b.orden ?? 0));
        },
        error: (error: unknown) => {
          this.error = error instanceof Error ? error.message : 'No se pudo cargar el portfolio.';
        },
      });
  }

  openLightbox(item: PortfolioItem): void {
    if (!item.imagenUrl) {
      return;
    }

    this.lightboxImageUrl = item.imagenUrl;
    this.lightboxTitle = item.titulo;
    this.lightboxOpen = true;
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
  }

  trackById(index: number, item: PortfolioItem): string {
    return item.id ?? String(index);
  }
}
