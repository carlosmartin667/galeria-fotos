import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';

import { SessionService } from '../../../core/services/session.service';

@Component({
  selector: 'app-guest-badge',
  standalone: true,
  imports: [NgIf],
  template: `<span *ngIf="session.guestMode" class="badge bg-warning text-dark">Modo invitado</span>`
})
export class GuestBadgeComponent {
  readonly session = inject(SessionService);
}
