import { Component, inject, ChangeDetectionStrategy } from '@angular/core';

import { SessionService } from '../../../core/services/session.service';

@Component({
  selector: 'app-guest-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <span
      class="badge"
      [class.bg-warning]="!session.isAuthenticated"
      [class.text-dark]="!session.isAuthenticated"
      [class.bg-success]="session.isUser"
      [class.bg-primary]="session.isAdmin"
    >
      {{ session.displayRole }}
    </span>
  `,
})
export class GuestBadgeComponent {
  readonly session = inject(SessionService);
}
