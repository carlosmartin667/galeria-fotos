import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';

import { SeoService } from '../../../core/services/seo.service';
import { AgendaDisponibilidadPublicaComponent } from './agenda-disponibilidad-publica.component';

@Component({
  selector: 'app-disponibilidad-public-page',
  standalone: true,
  imports: [AgendaDisponibilidadPublicaComponent],
  templateUrl: './disponibilidad-public-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './disponibilidad-public-page.component.css',
})
export class DisponibilidadPublicPageComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.setPublicPage({
      title: 'Disponibilidad de agenda',
      description:
        'Consulta fechas ocupadas proximas antes de solicitar un presupuesto fotografico.',
      image: '/assets/caterserv/img/background-site.jpg',
    });
  }
}
