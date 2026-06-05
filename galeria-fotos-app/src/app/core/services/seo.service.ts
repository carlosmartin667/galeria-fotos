import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { isSensitiveKey } from '../utils/sensitive-text';

export interface SeoPageConfig {
  title: string;
  description: string;
  type?: 'website' | 'article';
  image?: string | null;
}

const SITE_NAME = 'GaleriaFotos';
const FALLBACK_IMAGE = '/assets/caterserv/img/background-site.jpg';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  setPublicPage(config: SeoPageConfig): void {
    const title = this.fullTitle(config.title);
    const description = this.safeDescription(config.description);
    const image = this.safeImage(config.image);

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: config.type ?? 'website' });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
  }

  private fullTitle(value: string): string {
    const clean = this.clean(value) || SITE_NAME;
    return clean.includes(SITE_NAME) ? clean : `${clean} | ${SITE_NAME}`;
  }

  private safeDescription(value: string): string {
    return this.clean(value).slice(0, 170) || 'Fotografia profesional para eventos, sesiones y recuerdos importantes.';
  }

  private safeImage(value?: string | null): string {
    const image = this.clean(value ?? '');

    if (!image || this.hasSensitiveQuery(image)) {
      return FALLBACK_IMAGE;
    }

    return image;
  }

  private hasSensitiveQuery(value: string): boolean {
    const query = value.split('?')[1] ?? '';
    return query.split(/[&=]/).some((part) => isSensitiveKey(part));
  }

  private clean(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
  }
}
