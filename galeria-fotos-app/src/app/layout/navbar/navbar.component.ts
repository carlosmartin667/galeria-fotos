import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { SessionService } from '../../core/services/session.service';
import { GuestBadgeComponent } from '../../shared/components/guest-badge/guest-badge.component';

@Component({
  selector: 'app-internal-navbar',
  standalone: true,
  imports: [NgIf, RouterLink, RouterLinkActive, GuestBadgeComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class InternalNavbarComponent {
  readonly session = inject(SessionService);
  private readonly router = inject(Router);

  logout(): void {
    this.session.clear();
    void this.router.navigate(['/login']);
  }
}
