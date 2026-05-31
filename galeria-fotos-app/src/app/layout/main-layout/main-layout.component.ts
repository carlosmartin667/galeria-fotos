import { NgIf } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { InternalNavbarComponent } from '../navbar/navbar.component';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [NgIf, RouterLink, RouterOutlet, InternalNavbarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  readonly session = inject(SessionService);
  readonly year = new Date().getFullYear();
  readonly displayName = computed(() => this.session.session().nombre || this.session.session().email || 'Usuario');
}
