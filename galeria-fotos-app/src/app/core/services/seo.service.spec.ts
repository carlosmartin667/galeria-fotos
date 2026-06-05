import { Meta, Title } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';

import { SeoService } from './seo.service';

describe('SeoService', () => {
  let service: SeoService;
  let title: Title;
  let meta: Meta;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeoService);
    title = TestBed.inject(Title);
    meta = TestBed.inject(Meta);
  });

  it('sets title, description and Open Graph tags', () => {
    service.setPublicPage({
      title: 'Portfolio',
      description: 'Trabajos fotograficos publicados.',
      image: '/assets/caterserv/img/event-1.jpg'
    });

    expect(title.getTitle()).toBe('Portfolio | GaleriaFotos');
    expect(meta.getTag('name="description"')?.content).toBe('Trabajos fotograficos publicados.');
    expect(meta.getTag('property="og:title"')?.content).toBe('Portfolio | GaleriaFotos');
    expect(meta.getTag('property="og:image"')?.content).toBe('/assets/caterserv/img/event-1.jpg');
  });

  it('uses the public fallback image when image URL contains sensitive query params', () => {
    service.setPublicPage({
      title: 'Detalle',
      description: 'Detalle publico.',
      image: 'https://cdn.example.com/private.jpg?token=abc&signature=secret'
    });

    expect(meta.getTag('property="og:image"')?.content).toBe('/assets/caterserv/img/background-site.jpg');
  });
});
