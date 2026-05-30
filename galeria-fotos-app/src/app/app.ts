import { AfterViewInit, Component, OnDestroy, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Subscription, filter } from 'rxjs';

import { TemplateScriptsService } from './core/template-scripts.service';
import { BackToTopComponent } from './shared/back-to-top/back-to-top.component';
import { FooterComponent } from './shared/footer/footer.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { SpinnerComponent } from './shared/spinner/spinner.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SpinnerComponent, NavbarComponent, FooterComponent, BackToTopComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit, OnDestroy {
  protected readonly title = signal('galeria-fotos-app');
  private readonly router = inject(Router);
  private readonly templateScripts = inject(TemplateScriptsService);
  private readonly routerEvents: Subscription = this.router.events
    .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
    .subscribe(() => this.templateScripts.refresh());

  ngAfterViewInit(): void {
    this.templateScripts.refresh();
  }

  ngOnDestroy(): void {
    this.routerEvents.unsubscribe();
  }
}
