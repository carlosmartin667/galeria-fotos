import { CurrencyPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, finalize, forkJoin, of } from 'rxjs';

import { Evento } from '../../../core/models/evento.models';
import { PreguntaFrecuente } from '../../../core/models/faq.models';
import { PortfolioItem } from '../../../core/models/portfolio.models';
import { Promocion } from '../../../core/models/promocion.models';
import { ServicioFotografia } from '../../../core/models/servicio.models';
import { PerfilFotografa, SitioHome } from '../../../core/models/sitio-publico.models';
import { Testimonio } from '../../../core/models/testimonio.models';
import { PromocionesService } from '../../../core/services/promociones.service';
import { SitioPublicoService } from '../../../core/services/sitio-publico.service';
import { TestimoniosService } from '../../../core/services/testimonios.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-public-home',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgFor, NgIf, RouterLink, EmptyStateComponent, ErrorAlertComponent, LoadingComponent],
  templateUrl: './public-home.component.html',
  styleUrl: './public-home.component.css'
})
export class PublicHomeComponent implements OnInit {
  private readonly sitioService = inject(SitioPublicoService);
  private readonly promocionesService = inject(PromocionesService);
  private readonly testimoniosService = inject(TestimoniosService);
  private readonly cdr = inject(ChangeDetectorRef);

  home: SitioHome | null = null;
  perfil: PerfilFotografa | null = null;
  servicios: ServicioFotografia[] = [];
  portfolio: PortfolioItem[] = [];
  preguntas: PreguntaFrecuente[] = [];
  eventos: Evento[] = [];
  promociones: Promocion[] = [];
  testimonios: Testimonio[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    this.loading = true;

    forkJoin({
      home: this.sitioService.getHome(),
      promociones: this.promocionesService.getPublicas().pipe(catchError(() => of([]))),
      testimonios: this.testimoniosService.getDestacados().pipe(catchError(() => of([])))
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: ({ home, promociones, testimonios }) => {
        this.home = home;
        this.perfil = home.perfil ?? null;
        this.servicios = this.takeActive(home.servicios ?? [], 3);
        this.portfolio = this.takeFeatured(home.portfolio ?? [], 6);
        this.preguntas = this.takeActive(home.preguntasFrecuentes ?? [], 4);
        this.eventos = (home.eventosRecientes ?? []).slice(0, 3);
        this.promociones = this.takeFeaturedPromotions(promociones, 3);
        this.testimonios = testimonios.slice(0, 3);
      },
      error: (error: unknown) => {
        this.error = error instanceof Error ? error.message : 'No se pudo cargar el sitio publico.';
      }
    });
  }

  heroBackground(): string {
    return this.perfil?.bannerUrl || '/assets/caterserv/img/background-site.jpg';
  }

  trackById(_: number, item: { id?: string } | string): string {
    return typeof item === 'string' ? item : item.id ?? String(_);
  }

  couponCode(promocion: Promocion): string {
    return promocion.cuponCodigo || promocion.codigoCupon || '';
  }

  private takeActive<T extends { activo?: boolean; orden?: number | null }>(items: T[], count: number): T[] {
    return [...items]
      .filter((item) => item.activo !== false)
      .sort((a, b) => Number(a.orden ?? 0) - Number(b.orden ?? 0))
      .slice(0, count);
  }

  private takeFeatured(items: PortfolioItem[], count: number): PortfolioItem[] {
    const active = this.takeActive(items, items.length);
    const featured = active.filter((item) => item.destacado);
    return (featured.length > 0 ? featured : active).slice(0, count);
  }

  private takeFeaturedPromotions(items: Promocion[], count: number): Promocion[] {
    const active = this.takeActive(items, items.length);
    const featured = active.filter((item) => item.destacado || item.destacada);
    return (featured.length > 0 ? featured : active).slice(0, count);
  }
}
