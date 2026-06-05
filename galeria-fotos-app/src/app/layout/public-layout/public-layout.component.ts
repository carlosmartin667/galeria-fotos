import { Component, inject } from '@angular/core';

import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { SessionService } from '../../core/services/session.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.css',
})
export class PublicLayoutComponent {
  readonly session = inject(SessionService);
  readonly themeService = inject(ThemeService);
  readonly year = new Date().getFullYear();
  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  accountLink(): string {
    if (!this.session.isAuthenticated) {
      return '/login';
    }

    return this.session.isAdmin ? '/admin/dashboard' : '/dashboard';
  }

  accountLabel(): string {
    return this.session.isAuthenticated ? 'Panel' : 'Entrar';
  }
}
