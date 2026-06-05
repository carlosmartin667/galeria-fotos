import { NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { PreguntaFrecuente } from '../../../core/models/faq.models';
import { FaqService } from '../../../core/services/faq.service';
import { SeoService } from '../../../core/services/seo.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorAlertComponent } from '../../../shared/components/error-alert/error-alert.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-faq-public',
  standalone: true,
  imports: [FormsModule, NgClass, EmptyStateComponent, ErrorAlertComponent, LoadingComponent],
  templateUrl: './faq-public.component.html',
  styleUrl: './faq-public.component.css',
})
export class FaqPublicComponent implements OnInit {
  private readonly faqService = inject(FaqService);
  private readonly seo = inject(SeoService);
  private readonly cdr = inject(ChangeDetectorRef);

  preguntas: PreguntaFrecuente[] = [];
  searchTerm = '';
  category = 'Todas';
  openId = '';
  loading = false;
  error = '';

  ngOnInit(): void {
    this.seo.setPublicPage({
      title: 'Preguntas frecuentes',
      description:
        'Preguntas frecuentes sobre reservas, servicios fotograficos, eventos, compras y descargas de fotos.',
      image: '/assets/caterserv/img/background-site.jpg',
    });
    this.loading = true;

    this.faqService
      .getPublicas()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (preguntas) => {
          this.preguntas = [...preguntas].sort(
            (a, b) => Number(a.orden ?? 0) - Number(b.orden ?? 0),
          );
        },
        error: (error: unknown) => {
          this.error = error instanceof Error ? error.message : 'No se pudo cargar FAQ.';
        },
      });
  }

  get categories(): string[] {
    const categories = this.preguntas
      .map((item) => item.categoria?.trim())
      .filter(Boolean) as string[];
    return ['Todas', ...Array.from(new Set(categories))];
  }

  get filteredPreguntas(): PreguntaFrecuente[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.preguntas.filter((item) => {
      const matchesCategory = this.category === 'Todas' || item.categoria === this.category;
      const matchesSearch =
        !term ||
        [item.pregunta, item.respuesta, item.categoria].some((value) =>
          String(value ?? '')
            .toLowerCase()
            .includes(term),
        );
      return matchesCategory && matchesSearch;
    });
  }

  toggle(item: PreguntaFrecuente, index: number): void {
    const id = item.id ?? String(index);
    this.openId = this.openId === id ? '' : id;
  }

  isOpen(item: PreguntaFrecuente, index: number): boolean {
    return this.openId === (item.id ?? String(index));
  }

  trackById(index: number, item: PreguntaFrecuente): string {
    return item.id ?? String(index);
  }
}
