import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

const WOW_SCRIPT = '/assets/caterserv/lib/wow/wow.min.js';

const JQUERY_TEMPLATE_SCRIPTS = [
  '/assets/caterserv/lib/easing/easing.min.js',
  '/assets/caterserv/lib/waypoints/waypoints.min.js',
  '/assets/caterserv/lib/counterup/counterup.min.js',
  '/assets/caterserv/lib/lightbox/js/lightbox.min.js',
  '/assets/caterserv/lib/owlcarousel/owl.carousel.min.js'
];

interface CounterUpOptions {
  delay: number;
  time: number;
}

interface OwlCarouselOptions {
  loop: boolean;
  dots: boolean;
  rtl?: boolean;
  margin: number;
  autoplay: boolean;
  slideTransition: string;
  autoplayTimeout: number;
  autoplaySpeed: number;
  autoplayHoverPause: boolean;
  responsive: Record<number, { items: number }>;
}

interface JQueryCollection {
  not(selector: string): JQueryCollection;
  attr(name: string, value: string): JQueryCollection;
  counterUp(options: CounterUpOptions): JQueryCollection;
  owlCarousel(options: OwlCarouselOptions): JQueryCollection;
}

interface JQueryStatic {
  (selector: string): JQueryCollection;
  fn?: {
    counterUp?: unknown;
    owlCarousel?: unknown;
  };
}

interface TemplateWindow extends Window {
  WOW?: new () => { init: () => void };
  bootstrap?: unknown;
  jQuery?: JQueryStatic;
  lightbox?: { option: (options: Record<string, unknown>) => void };
}

@Injectable({ providedIn: 'root' })
export class TemplateScriptsService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private scriptsPromise?: Promise<void>;
  private refreshTimer?: number;

  refresh(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    window.clearTimeout(this.refreshTimer);
    this.refreshTimer = window.setTimeout(() => {
      this.hideSpinner();
      this.setupBackToTop();
      this.setupBootstrapFallbacks();
      this.setupVideoModal();
      void this.loadTemplateScripts().then(() => this.initializePlugins());
    }, 80);
  }

  private hideSpinner(): void {
    this.document.getElementById('spinner')?.classList.remove('show');
  }

  private setupBackToTop(): void {
    const button = this.document.querySelector<HTMLElement>('.back-to-top');

    if (!button || button.dataset['caterservReady']) {
      return;
    }

    const updateVisibility = () => {
      button.style.display = window.scrollY > 300 ? 'flex' : 'none';
    };

    button.addEventListener('click', (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', updateVisibility, { passive: true });
    button.dataset['caterservReady'] = 'true';
    updateVisibility();
  }

  private setupBootstrapFallbacks(): void {
    const win = window as TemplateWindow;

    if (win.bootstrap) {
      return;
    }

    this.document.querySelectorAll<HTMLElement>('[data-bs-toggle="collapse"]').forEach((trigger) => {
      if (trigger.dataset['caterservBsReady']) {
        return;
      }

      trigger.addEventListener('click', () => {
        const target = this.findTarget(trigger);

        if (!target) {
          return;
        }

        const isOpen = target.classList.toggle('show');
        trigger.setAttribute('aria-expanded', String(isOpen));
      });
      trigger.dataset['caterservBsReady'] = 'true';
    });

    this.document.querySelectorAll<HTMLElement>('[data-bs-toggle="dropdown"]').forEach((trigger) => {
      if (trigger.dataset['caterservBsReady']) {
        return;
      }

      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        const menu = trigger.parentElement?.querySelector<HTMLElement>('.dropdown-menu');

        this.document.querySelectorAll<HTMLElement>('.dropdown-menu.show').forEach((openMenu) => {
          if (openMenu !== menu) {
            openMenu.classList.remove('show');
          }
        });
        menu?.classList.toggle('show');
      });
      trigger.dataset['caterservBsReady'] = 'true';
    });

    this.document.querySelectorAll<HTMLElement>('[data-bs-toggle="pill"]').forEach((trigger) => {
      if (trigger.dataset['caterservBsReady']) {
        return;
      }

      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        const target = this.findTarget(trigger);

        if (!target) {
          return;
        }

        this.document.querySelectorAll<HTMLElement>('[data-bs-toggle="pill"].active').forEach((item) => {
          item.classList.remove('active');
        });
        this.document.querySelectorAll<HTMLElement>('.tab-pane.show.active').forEach((pane) => {
          pane.classList.remove('show', 'active');
        });
        trigger.classList.add('active');
        target.classList.add('show', 'active');
      });
      trigger.dataset['caterservBsReady'] = 'true';
    });

    this.document.querySelectorAll<HTMLElement>('[data-bs-toggle="modal"]').forEach((trigger) => {
      if (trigger.dataset['caterservBsReady']) {
        return;
      }

      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        const target = this.findTarget(trigger);

        if (target) {
          this.openModal(target);
        }
      });
      trigger.dataset['caterservBsReady'] = 'true';
    });

    this.document.querySelectorAll<HTMLElement>('[data-bs-dismiss="modal"]').forEach((trigger) => {
      if (trigger.dataset['caterservBsReady']) {
        return;
      }

      trigger.addEventListener('click', () => {
        const modal = trigger.closest<HTMLElement>('.modal');

        if (modal) {
          this.closeModal(modal);
        }
      });
      trigger.dataset['caterservBsReady'] = 'true';
    });
  }

  private findTarget(trigger: HTMLElement): HTMLElement | null {
    const selector = trigger.getAttribute('data-bs-target') ?? trigger.getAttribute('href');

    if (!selector || !selector.startsWith('#')) {
      return null;
    }

    return this.document.querySelector<HTMLElement>(selector);
  }

  private openModal(modal: HTMLElement): void {
    modal.style.display = 'block';
    modal.removeAttribute('aria-hidden');
    modal.setAttribute('aria-modal', 'true');
    modal.classList.add('show');
    this.document.body.classList.add('modal-open');

    if (!this.document.querySelector('.modal-backdrop')) {
      const backdrop = this.document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      backdrop.addEventListener('click', () => this.closeModal(modal));
      this.document.body.appendChild(backdrop);
    }

    modal.dispatchEvent(new Event('shown.bs.modal'));
  }

  private closeModal(modal: HTMLElement): void {
    modal.dispatchEvent(new Event('hide.bs.modal'));
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    modal.removeAttribute('aria-modal');
    modal.classList.remove('show');
    this.document.body.classList.remove('modal-open');
    this.document.querySelector('.modal-backdrop')?.remove();
  }

  private setupVideoModal(): void {
    const modal = this.document.getElementById('videoModal');
    const iframe = this.document.getElementById('video') as HTMLIFrameElement | null;

    if (!modal || !iframe || modal.dataset['caterservVideoReady']) {
      return;
    }

    let videoSrc = '';

    this.document.querySelectorAll<HTMLButtonElement>('.btn-play').forEach((button) => {
      button.addEventListener('click', () => {
        videoSrc = button.dataset['src'] ?? '';
      });
    });

    modal.addEventListener('shown.bs.modal', () => {
      if (videoSrc) {
        iframe.src = videoSrc + '?autoplay=1&modestbranding=1&showinfo=0';
      }
    });

    modal.addEventListener('hide.bs.modal', () => {
      iframe.src = videoSrc;
    });

    modal.dataset['caterservVideoReady'] = 'true';
  }

  private loadTemplateScripts(): Promise<void> {
    if (this.scriptsPromise) {
      return this.scriptsPromise;
    }

    const win = window as TemplateWindow;
    const scripts = win.jQuery ? [WOW_SCRIPT, ...JQUERY_TEMPLATE_SCRIPTS] : [WOW_SCRIPT];

    this.scriptsPromise = scripts.reduce(
      (promise, source) => promise.then(() => this.appendScript(source)),
      Promise.resolve()
    );

    return this.scriptsPromise;
  }

  private appendScript(source: string): Promise<void> {
    const existing = this.document.querySelector<HTMLScriptElement>('script[src="' + source + '"]');

    if (existing) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = this.document.createElement('script');
      script.src = source;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Unable to load ' + source));
      this.document.body.appendChild(script);
    });
  }

  private initializePlugins(): void {
    const win = window as TemplateWindow;
    const $ = win.jQuery;

    if (win.WOW) {
      new win.WOW().init();
    }

    if (!$) {
      return;
    }

    if ($.fn?.counterUp) {
      $('[data-toggle="counter-up"]')
        .not('[data-counter-ready="true"]')
        .attr('data-counter-ready', 'true')
        .counterUp({ delay: 10, time: 2000 });
    }

    if ($.fn?.owlCarousel) {
      $('.testimonial-carousel-1').not('.owl-loaded').owlCarousel({
        loop: true,
        dots: false,
        margin: 25,
        autoplay: true,
        slideTransition: 'linear',
        autoplayTimeout: 0,
        autoplaySpeed: 10000,
        autoplayHoverPause: false,
        responsive: {
          0: { items: 1 },
          575: { items: 1 },
          767: { items: 2 },
          991: { items: 3 }
        }
      });

      $('.testimonial-carousel-2').not('.owl-loaded').owlCarousel({
        loop: true,
        dots: false,
        rtl: true,
        margin: 25,
        autoplay: true,
        slideTransition: 'linear',
        autoplayTimeout: 0,
        autoplaySpeed: 10000,
        autoplayHoverPause: false,
        responsive: {
          0: { items: 1 },
          575: { items: 1 },
          767: { items: 2 },
          991: { items: 3 }
        }
      });
    }

    win.lightbox?.option({ resizeDuration: 200, wrapAround: true });
  }
}
