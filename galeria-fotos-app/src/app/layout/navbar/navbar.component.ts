import { Component, inject } from '@angular/core';

import { SessionService } from '../../core/services/session.service';
import { GuestBadgeComponent } from '../../shared/components/guest-badge/guest-badge.component';

@Component({
  selector: 'app-internal-navbar',
  standalone: true,
  imports: [GuestBadgeComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class InternalNavbarComponent {
  readonly session = inject(SessionService);
}
