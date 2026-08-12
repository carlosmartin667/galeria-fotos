import {
  AfterViewInit,
  Component,
  DestroyRef,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { TemplateScriptsService } from './core/template-scripts.service';
import { ThemeService } from './core/services/theme.service';
import { BackToTopComponent } from './shared/back-to-top/back-to-top.component';
import { SpinnerComponent } from './shared/spinner/spinner.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SpinnerComponent, BackToTopComponent],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.css',
})
export class App implements AfterViewInit {
  protected readonly title = signal('galeria-fotos-app');
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly templateScripts = inject(TemplateScriptsService);
  private readonly themeService = inject(ThemeService);

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.templateScripts.refresh());
  }

  ngAfterViewInit(): void {
    this.themeService.setTheme(this.themeService.getTheme());
    this.templateScripts.refresh();
  }
}
