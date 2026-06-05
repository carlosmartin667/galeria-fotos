import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { SessionService } from '../../core/services/session.service';
import { ThemeService } from '../../core/services/theme.service';
import { GuestBadgeComponent } from '../../shared/components/guest-badge/guest-badge.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, GuestBadgeComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  readonly session = inject(SessionService);
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  logout(): void {
    this.session.clear();
    void this.router.navigate(['/login']);
  }
}
